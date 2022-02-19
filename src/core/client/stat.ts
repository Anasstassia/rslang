import { isToday } from 'date-fns';
import { client } from './index';
import { state, StatResponse } from './users';

export const updateSprintGameStatistics = async (sprintGame: StatResponse['optional']['sprintGame']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const now = new Date();
  // const lastStatDate = currentStat.data.optional.date;

  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      date: now,
      sprintGame,
    },
  });
  return response;
};

export const updateAudioCallGameStatistics = async (audioGame: StatResponse['optional']['audioGame']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      audioGame,
    },
  });
  return response;
};

export const getStat = async () => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const lastStatDate = currentStat.data.optional.date;
  const optional = {
    date: new Date(),
    sprintGame: {
      gamesPlayed: 0,
      totalCorrectWords: 0,
      mostWordsInRow: 0,
      newWords: 0,
    },
    audioGame: {
      gamesPlayed: 0,
      totalCorrectWords: 0,
      mostWordsInRow: 0,
      newWords: 0,
    },
  };

  if (!currentStat.data.optional.date || !isToday(new Date(lastStatDate))) {
    await client.put(`/users/${state?.currentUser?.id}/statistics`, {
      learnedWords: currentStat.data.learnedWords,
      optional: {
        ...optional,
        learnedPages: currentStat.data.optional.learnedPages,
      },
    });
  }
  if (isToday(new Date(lastStatDate))) {
    return currentStat.data;
  }
  return { optional };
};

export const updateLearnedPagesStatistics = async (learnedPages: StatResponse['optional']['learnedPages']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      learnedPages,
    },
  });
  return response;
};
