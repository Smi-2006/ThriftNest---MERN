import api from './api'

export const rewardEndpoints = {
  points: '/api/users/points',
}

export const getRewardSummary = async () => api.get(rewardEndpoints.points)
