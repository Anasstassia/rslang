import { client } from './index';
import { state, StatResponse } from './users';

export const updateSprintGameStatistics = async (sprintGame: StatResponse['optional']['sprintGame']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      sprintGame,
    },
  });
  return response;
};

export const updateAudioCallGameStatistics = async (audioGame: StatResponse['optional']['audioGame']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const todayDate = new Date();
  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      date: todayDate.getDate(),
      audioGame,
    },
  });
  return response;
};

export const updateLearnedPagesStatistics = async (learnedPages: StatResponse['optional']['learnedPages']) => {
  const currentStat = await client.get(`/users/${state?.currentUser?.id}/statistics`);
  const todayDate = new Date();
  const response = await client.put(`/users/${state?.currentUser?.id}/statistics`, {
    learnedWords: currentStat.data.learnedWords,
    optional: {
      ...currentStat.data?.optional,
      learnedWords: todayDate.getDate(),
      learnedPages,
    },
  });
  return response;
};
