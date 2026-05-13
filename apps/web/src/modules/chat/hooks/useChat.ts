import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';
import { deleteChat, getChatMessages, getUserChats, renameChat } from '../api/chat.api';
import { ChatDeleteResponse, ChatUpdateTitleResponse, Chat } from '@perpx/shared/types/chat.type';
import { Message } from '@perpx/shared/types/message.type';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/apis/auth.error.api';
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

export const useGetUserChats = () => {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: ['user-chats'],
    queryFn: async () => {
      const data = await getUserChats();
      if (data.success) {
        dispatch(setChats(data.data.chats as Chat[]));
      }
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
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
    enabled: !!chatId,
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
      if (data.success) {
        dispatch(
          updateChatTitle({ id: data.data.id, title: data.data.title, updatedAt: new Date() }),
        );
        queryClient.invalidateQueries({ queryKey: ['user-chats'] });
        toast.success(`${data.data.title.slice(0, 16)} renamed` || 'Chat renamed successfully.');
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
        toast.success(`${data.data.title} deleted` || 'Chat deleted successfull.');
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
  const tempHumanMsgIdRef = useRef(''); // Hook top level par add karein

  // Streaming text ko component lifecycle se independent rakhne ke liye useRef use karenge
  const streamingMessageRef = useRef('');

  useEffect(() => {
    const socket = getSocket(access_token);

    if (!socket.connected) {
      socket.connect();
    }

    // Handlers define kar rahe hain
    const onStreamMessage = ({ token, chatId }: { token: string; chatId: string }) => {
      dispatch(setActiveChatId(chatId));
      dispatch(appendStreamingToken(token));
      streamingMessageRef.current += token;
    };

    const onStreamEnd = ({ message }: { message: Message }) => {
      // const fullMessage = streamingMessageRef.current;

      // Stream end hone par full message ko permanently Redux me add kar do
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

      dispatch(clearStreamingMessage());
      dispatch(setIsStreaming(false));
      streamingMessageRef.current = '';

      // Agar user home page par hai, toh usko chat URL par bhej do
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('chatId') !== message.chatId) {
        router.push(`/?chatId=${message.chatId}`);
      }

      // Sidebar history update karne ke liye sirf user-chats ko invalidate karo.
      // DHYAN DEIN: Yahan chat-messages invalidate nahi kar rahe hain taaki Redux override na ho aur lag na aaye.
      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
    };

    const onTitleGenerated = ({ title, chatId }: { title: string; chatId: string }) => {
      dispatch(updateChatTitle({ id: chatId, title, updatedAt: new Date() }));
    };

    const onHumanMessage = ({ humanMessage }: { humanMessage: Message }) => {
      dispatch(
        updateHumanMessageId({
          tempId: tempHumanMsgIdRef.current,
          realMessage: humanMessage,
        }),
      );
    };

    const onStreamError = ({ message }: { message: string }) => {
      toast.error(message);
      dispatch(setError(message));
      dispatch(setIsStreaming(false));
    };

    // Listeners attach karna (Ye sirf ek baar hoga jab hook mount hoga)
    socket.on('streamMessage', onStreamMessage);
    socket.on('streamEnd', onStreamEnd);
    socket.on('humanMessage', onHumanMessage);
    socket.on('titleGenerated', onTitleGenerated);
    socket.on('streamError', onStreamError);

    // Cleanup function: Jab component unmount ho tabhi listeners hatein
    return () => {
      socket.off('streamMessage', onStreamMessage);
      socket.off('streamEnd', onStreamEnd);
      socket.off('humanMessage', onHumanMessage);
      socket.off('titleGenerated', onTitleGenerated);
      socket.off('streamError', onStreamError);
    };
  }, [access_token, dispatch, queryClient, router]);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      const socket = getSocket(access_token);
      if (!socket.connected) socket.connect();

      dispatch(setIsStreaming(true));
      dispatch(setStreamingMessage(''));
      streamingMessageRef.current = '';

      const tempId = 'user-msg-' + Date.now();
      tempHumanMsgIdRef.current = tempId; // ID save kar li reference ke liye

      // 🔥 OPTIMISTIC UPDATE: User ka message turant screen par show karo bina server ka wait kiye
      if (payload.message) {
        dispatch(
          addMessage({
            id: tempId,
            role: 'HUMAN',
            message: payload.message,
            chatId: payload.chatId || 'temp-chat',
            userId: 'user', // apna real user ID dal sakte ho
            createdAt: new Date().toISOString(), // Date object hi chahiye, string nahi
          }),
        );
      }

      socket.emit('sendMessage', payload);
    },
    [access_token, dispatch],
  );

  return { sendMessage };
};
