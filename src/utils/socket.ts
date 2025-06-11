import { socketIO } from '../main';

export const sendVocabNotification = (
  type: 'deleted' | 'created' | 'updated' | 'multi-deleted' | 'multi-created',
  data: {
    message: string;
    vocabId?: string;
    vocabIds?: string[];
    word?: string;
    count?: number;
    userEmail: string;
  }
) => {
  socketIO.to('all-users').emit('vocab-notification', {
    type,
    message: data.message,
    timestamp: new Date(),
    data: {
      vocabId: data.vocabId,
      vocabIds: data.vocabIds,
      word: data.word,
      count: data.count,
      userEmail: data.userEmail,
    },
  });
};
