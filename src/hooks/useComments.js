import { useCallback, useEffect, useState } from 'react';
import { addComment as addCommentDoc, deleteComment as deleteCommentDoc, getComments } from '../services/commentService';
import { useAuth } from './useAuth';

export function useComments(entryId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!entryId) {
      setComments([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getComments(entryId);
      setComments(list);
    } catch (err) {
      console.error('[useComments]', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addComment = useCallback(
    async (commentData) => {
      if (!entryId) return;
      await addCommentDoc(entryId, commentData);
      await refresh();
    },
    [entryId, refresh]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      if (!entryId || !user?.uid) return;
      await deleteCommentDoc(entryId, commentId, user.uid);
      await refresh();
    },
    [entryId, refresh, user?.uid]
  );

  if (!entryId) {
    return {
      comments: [],
      loading: false,
      addComment: async () => {},
      deleteComment: async () => {},
      refresh: async () => {},
    };
  }

  return { comments, loading, addComment, deleteComment, refresh };
}
