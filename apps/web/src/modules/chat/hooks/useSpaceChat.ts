import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';
import {
  getChatMessages,
  getSpaceChats,
  getSpaceChatHistory,
  updateSpaceChat as updateSpaceChatApi,
  deleteSpaceChat as deleteSpaceChatApi,
} from '../api/chat.api';
import { ChatListResponse, Chat } from '@perpx/shared/types/chat.type';
import { Message, MessageListResponse, SendMessagePayload } from '@perpx/shared/types/message.type';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/api/auth.error.api';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addSpaceMessage,
  appendSpaceStreamingToken,
  clearSpaceStreamingMessage,
  deleteSpaceChat as deleteSpaceChatFromSlice,
  setSpaceActiveChatId,
  setSpaceError,
  setSpaceIsStreaming,
  setSpaceMessages,
  setSpaceChats,
  updateSpaceChatTitle,
  setSpaceStreamingMessage,
  updateSpaceHumanMessageId,
} from '../slices/spaceChatSlice';
import { getSocket } from '../../../lib/socket';
import { useRouter } from 'next/navigation';

export const useGetSpaceChats = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['space-chats', spaceId],
    queryFn: async () => {
      const data = await getSpaceChats(spaceId);
      if (data.success) {
        const oldData = queryClient.getQueryData<ChatListResponse>(['space-chats', spaceId]);
        if (oldData?.success && oldData.data?.chats) {
          const oldMap = new Map(oldData.data.chats.map((c: Chat) => [c.id, c.updatedAt]));
          data.data.chats = data.data.chats.map((c: Chat) => {
            const oldUpdated = oldMap.get(c.id);
            if (oldUpdated && new Date(oldUpdated) > new Date(c.updatedAt)) {
              return { ...c, updatedAt: oldUpdated };
            }
            return c;
          });
        }
      }
      return data;
    },
    enabled: !!spaceId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data?.success && query.data?.data?.chats) {
      dispatch(setSpaceChats(query.data.data.chats as Chat[]));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useSpaceChatHistory = (spaceId: string, limit: number = 20) => {
  const dispatch = useAppDispatch();
  const query = useInfiniteQuery({
    queryKey: ['space-chat-history', spaceId, limit],
    queryFn: ({ pageParam }) => getSpaceChatHistory({ spaceId, pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.data?.nextCursor ? lastPage.data.nextCursor : undefined,
    enabled: !!spaceId,
  });

  useEffect(() => {
    if (query.data?.pages) {
      const allChats: Chat[] = [];
      query.data.pages.forEach((page) => {
        if (page.success && page.data?.chats) {
          allChats.push(...page.data.chats);
        }
      });
      dispatch(setSpaceChats(allChats));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useGetSpaceChatMessages = (chatId: string) => {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const data = await getChatMessages(chatId);
      if (data.success) {
        dispatch(setSpaceMessages(data.data.messages as Message[]));
      }
      return data;
    },
    enabled: !!chatId && chatId !== 'temp-chat',
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSpaceChat = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) =>
      updateSpaceChatApi({ spaceId, chatId, title }),
    onSuccess: (data) => {
      if (data.success && data.data?.chat) {
        dispatch(
          updateSpaceChatTitle({
            id: data.data.chat.id,
            title: data.data.chat.title,
            updatedAt: data.data.chat.updatedAt || new Date().toISOString(),
          }),
        );
        queryClient.invalidateQueries({ queryKey: ['space-chats', spaceId] });
        toast.success(`Chat renamed to "${data.data.chat.title}"`);
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDeleteSpaceChat = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => deleteSpaceChatApi({ spaceId, chatId }),
    onSuccess: (data, chatId) => {
      if (data.success) {
        dispatch(deleteSpaceChatFromSlice(chatId));
        queryClient.invalidateQueries({ queryKey: ['space-chats', spaceId] });
        toast.success(data.message || 'Chat deleted successfully.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useSpaceChat = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { access_token } = useAppSelector((s) => s.auth);
  const tempHumanMsgIdRef = useRef('');
  const streamingMessageRef = useRef('');

  const updateTanstackCache = useCallback(
    (chatId: string, newMessage: Message) => {
      queryClient.setQueryData<MessageListResponse | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !oldData.success || !oldData.data) return oldData;
          const exists = oldData.data.messages.some((m: Message) => m.id === newMessage.id);
          if (exists) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                messages: oldData.data.messages.map((m: Message) =>
                  m.id === newMessage.id ? newMessage : m,
                ),
              },
            };
          }
          return {
            ...oldData,
            data: {
              ...oldData.data,
              messages: [...oldData.data.messages, newMessage],
            },
          };
        },
      );
    },
    [queryClient],
  );

  const updateSpaceChatListTimestamp = useCallback(
    (chatId: string, updatedAt: string, title?: string) => {
      if (!spaceId) return;

      if (title) {
        dispatch(updateSpaceChatTitle({ id: chatId, title, updatedAt }));
      }

      queryClient.setQueryData(['space-chats', spaceId], (oldData: ChatListResponse) => {
        if (!oldData || !oldData.success || !oldData.data || !oldData.data.chats) return oldData;
        const chats = [...oldData.data.chats];
        const index = chats.findIndex((c: Chat) => c.id === chatId);
        if (index !== -1) {
          chats[index] = { ...chats[index], updatedAt };
          if (title) chats[index].title = title;
        }
        return { ...oldData, data: { ...oldData.data, chats } };
      });
    },
    [queryClient, spaceId, dispatch],
  );

  useEffect(() => {
    const socket = getSocket(access_token);

    if (!socket.connected) {
      socket.connect();
    }

    const onStreamMessage = ({ token, chatId }: { token: string; chatId: string }) => {
      dispatch(setSpaceActiveChatId(chatId));
      dispatch(appendSpaceStreamingToken(token));
      streamingMessageRef.current += token;
    };

    const onStreamEnd = ({ message }: { message: Message }) => {
      dispatch(
        addSpaceMessage({
          id: message.id,
          role: message.role,
          message: message.message,
          chatId: message.chatId,
          userId: message.userId,
          createdAt: message.createdAt,
        }),
      );

      updateTanstackCache(message.chatId, message);
      updateSpaceChatListTimestamp(message.chatId, message.createdAt);

      dispatch(clearSpaceStreamingMessage());
      dispatch(setSpaceIsStreaming(false));
      streamingMessageRef.current = '';

      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('chatId') !== message.chatId) {
        router.push(`${currentUrl.pathname}?chatId=${message.chatId}`);
      }

      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ['space-chats', spaceId] });
      }
    };

    const onTitleGenerated = ({ title, chatId }: { title: string; chatId: string }) => {
      const newUpdatedAt = new Date().toISOString();
      updateSpaceChatListTimestamp(chatId, newUpdatedAt, title);
    };

    const onHumanMessage = ({ humanMessage }: { humanMessage: Message }) => {
      dispatch(setSpaceActiveChatId(humanMessage.chatId));

      dispatch(
        updateSpaceHumanMessageId({
          tempId: tempHumanMsgIdRef.current,
          realMessage: humanMessage,
        }),
      );

      updateTanstackCache(humanMessage.chatId, humanMessage);
      updateSpaceChatListTimestamp(humanMessage.chatId, humanMessage.createdAt);
    };

    const onStreamError = ({ message }: { message: string }) => {
      toast.error(message);
      dispatch(setSpaceError(message));
      dispatch(setSpaceIsStreaming(false));
    };

    socket.on('streamMessage', onStreamMessage);
    socket.on('humanMessage', onHumanMessage);
    socket.on('titleGenerated', onTitleGenerated);
    socket.on('streamEnd', onStreamEnd);
    socket.on('streamError', onStreamError);

    return () => {
      socket.off('streamMessage', onStreamMessage);
      socket.off('humanMessage', onHumanMessage);
      socket.off('titleGenerated', onTitleGenerated);
      socket.off('streamEnd', onStreamEnd);
      socket.off('streamError', onStreamError);
    };
  }, [
    access_token,
    dispatch,
    queryClient,
    router,
    spaceId,
    updateTanstackCache,
    updateSpaceChatListTimestamp,
  ]);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      const socket = getSocket(access_token);
      if (!socket.connected) socket.connect();

      dispatch(setSpaceIsStreaming(true));
      dispatch(setSpaceStreamingMessage(''));
      streamingMessageRef.current = '';

      const tempId = 'user-msg-' + Date.now();
      tempHumanMsgIdRef.current = tempId;

      const targetChatId = payload.chatId || 'temp-chat';

      if (!payload.chatId) {
        dispatch(setSpaceActiveChatId(targetChatId));
      }

      let sources: { url: string; title: string; snippet: string }[] = [];
      if (payload.attachments) {
        sources = payload.attachments
          .filter((attachment) => attachment.fileUrl)
          .map((attachment) => ({
            url: attachment.fileUrl!,
            title: attachment.name,
            snippet: attachment.type,
          }));
      }

      if (payload.message) {
        dispatch(
          addSpaceMessage({
            id: tempId,
            role: 'HUMAN',
            message: payload.message,
            chatId: targetChatId,
            userId: 'user',
            createdAt: new Date().toISOString(),
            sources,
          }),
        );
        updateSpaceChatListTimestamp(targetChatId, new Date().toISOString());
      }

      socket.emit('sendMessage', payload);
    },
    [access_token, dispatch, updateSpaceChatListTimestamp],
  );

  return { sendMessage };
};
