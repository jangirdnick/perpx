import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';
import {
  deleteChat,
  getChatHistory,
  getChatMessages,
  getSidebarUserChats,
  renameChat,
} from '../api/chat.api';
import {
  ChatDeleteResponse,
  ChatUpdateTitleResponse,
  Chat,
  ChatListResponse,
} from '@perpx/shared/types/chat.type';
import { Message, MessageListResponse } from '@perpx/shared/types/message.type';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/api/auth.error.api';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addMessage,
  appendStreamingToken,
  clearStreamingMessage,
  deleteChat as deleteChatFromSlice,
  setActiveChatId,
  setChats,
  setError,
  setIsStreaming,
  setMessages,
  setStreamingMessage,
  updateChatTitle,
  updateHumanMessageId,
} from '../slices/chatSlice';
import { getSocket } from '../../../lib/socket';
import { SendMessagePayload } from '@perpx/shared/types/message.type';
import { useRouter } from 'next/navigation';

export const useGetSidebarUserChats = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['user-chats'],
    queryFn: async () => {
      const data = await getSidebarUserChats();
      if (data.success) {
        const oldData = queryClient.getQueryData<ChatListResponse>(['user-chats']);
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
        dispatch(setChats(data.data.chats as Chat[]));
      }
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useChatHistory = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['chat-history', limit],
    queryFn: ({ pageParam }) => getChatHistory({ pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.data?.nextCursor ? lastPage.data.nextCursor : undefined,
  });
};

export const useGetChatMessages = (chatId: string) => {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const data = await getChatMessages(chatId);
      if (data.success) {
        dispatch(setMessages(data.data.messages as Message[]));
      }
      return data;
    },
    enabled: !!chatId && chatId !== 'temp-chat',
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRenameChat = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) =>
      renameChat({ chatId, title }),
    onSuccess: (data: ChatUpdateTitleResponse) => {
      if (data.success && data.data?.chat) {
        const updatedChat = data.data.chat;
        dispatch(
          updateChatTitle({
            id: updatedChat.id,
            title: updatedChat.title,
            updatedAt: updatedChat.updatedAt || new Date().toISOString(),
          }),
        );
        queryClient.invalidateQueries({ queryKey: ['user-chats'] });
        toast.success(
          updatedChat.title
            ? `${updatedChat.title.slice(0, 16)} renamed`
            : 'Chat renamed successfully.',
        );
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDeleteChat = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatId: string) => deleteChat(chatId),
    onSuccess: (data: ChatDeleteResponse) => {
      if (data.success) {
        dispatch(deleteChatFromSlice(data.data.id));
        queryClient.invalidateQueries({ queryKey: ['user-chats'] });
        toast.success(`${data.message}` || 'Chat deleted successfull.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useChat = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { access_token } = useAppSelector((s) => s.auth);
  const tempHumanMsgIdRef = useRef('');
  const streamingMessageRef = useRef('');

  // TanStack Cache ko manually update
  const updateTanstackCache = useCallback(
    (chatId: string, newMessage: Message) => {
      queryClient.setQueryData<MessageListResponse | undefined>(
        ['chat-messages', chatId],
        (oldData) => {
          if (!oldData || !oldData.success || !oldData.data) return oldData;

          // Check karte hain ki message pehle se cache me hai ya nahi (Duplicates rokne ke liye)
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

          // Agar nahi hai, toh array me naya message push kar do
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

  const updateChatListTimestamp = useCallback(
    (chatId: string, updatedAt: string) => {
      queryClient.setQueryData(['user-chats'], (oldData: ChatListResponse) => {
        if (!oldData || !oldData.success || !oldData.data || !oldData.data.chats) return oldData;
        const chats = [...oldData.data.chats];
        const index = chats.findIndex((c: Chat) => c.id === chatId);
        if (index !== -1) {
          chats[index] = { ...chats[index], updatedAt };
        }
        return { ...oldData, data: { ...oldData.data, chats } };
      });
    },
    [queryClient],
  );

  useEffect(() => {
    const socket = getSocket(access_token);

    if (!socket.connected) {
      socket.connect();
    }

    const onStreamMessage = ({ token, chatId }: { token: string; chatId: string }) => {
      dispatch(setActiveChatId(chatId));
      dispatch(appendStreamingToken(token));
      streamingMessageRef.current += token;
    };

    const onStreamEnd = ({ message }: { message: Message }) => {
      dispatch(
        addMessage({
          id: message.id,
          role: message.role,
          message: message.message,
          chatId: message.chatId,
          userId: message.userId,
          createdAt: message.createdAt,
        }),
      );

      // UPDATE CACHE: AI ka message bhi cache me daal diya
      updateTanstackCache(message.chatId, message);
      updateChatListTimestamp(message.chatId, message.createdAt);

      dispatch(clearStreamingMessage());
      dispatch(setIsStreaming(false));
      streamingMessageRef.current = '';

      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('chatId') !== message.chatId) {
        router.push(`/?chatId=${message.chatId}`);
      }

      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
    };

    const onTitleGenerated = ({ title, chatId }: { title: string; chatId: string }) => {
      const newUpdatedAt = new Date().toISOString();
      dispatch(updateChatTitle({ id: chatId, title, updatedAt: newUpdatedAt }));

      queryClient.setQueryData(['user-chats'], (oldData: ChatListResponse) => {
        if (!oldData || !oldData.success || !oldData.data || !oldData.data.chats) return oldData;
        const chats = [...oldData.data.chats];
        const index = chats.findIndex((c: Chat) => c.id === chatId);
        if (index !== -1) {
          chats[index] = { ...chats[index], title, updatedAt: newUpdatedAt };
        }
        return { ...oldData, data: { ...oldData.data, chats } };
      });
    };

    const onHumanMessage = ({ humanMessage }: { humanMessage: Message }) => {
      dispatch(setActiveChatId(humanMessage.chatId));

      dispatch(
        updateHumanMessageId({
          tempId: tempHumanMsgIdRef.current,
          realMessage: humanMessage,
        }),
      );

      // UPDATE CACHE: User ka final message bhi cache me daal diya
      updateTanstackCache(humanMessage.chatId, humanMessage);
      updateChatListTimestamp(humanMessage.chatId, humanMessage.createdAt);
    };

    const onStreamError = ({ message }: { message: string }) => {
      toast.error(message);
      dispatch(setError(message));
      dispatch(setIsStreaming(false));
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
  }, [access_token, dispatch, queryClient, router, updateTanstackCache, updateChatListTimestamp]);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      const socket = getSocket(access_token);
      if (!socket.connected) socket.connect();

      dispatch(setIsStreaming(true));
      dispatch(setStreamingMessage(''));
      streamingMessageRef.current = '';

      const tempId = 'user-msg-' + Date.now();
      tempHumanMsgIdRef.current = tempId;

      const targetChatId = payload.chatId || 'temp-chat';

      if (!payload.chatId) {
        dispatch(setActiveChatId(targetChatId));
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
          addMessage({
            id: tempId,
            role: 'HUMAN',
            message: payload.message,
            chatId: targetChatId,
            userId: 'user',
            createdAt: new Date().toISOString(),
            sources,
          }),
        );
        updateChatListTimestamp(targetChatId, new Date().toISOString());
      }

      socket.emit('sendMessage', payload);
    },
    [access_token, dispatch, updateChatListTimestamp],
  );

  return { sendMessage };
};
