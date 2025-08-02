'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Star, Award, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Achievement, StreakData } from '../lib/types';
import { storage } from '../lib/storage';
import { calculateStreaks, checkAchievements } from '../lib/utils';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

const Gamification: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = () => {
    const user = storage.getUser();
    const expenses = storage.getExpenses();
    const savingsGoals = storage.getSavingsGoals();
    const budgetLimits = storage.getUser().preferences.budgetLimits;

    // Calculate streaks
    const streaks = calculateStreaks(expenses);
    setStreakData(streaks);

    // Check and update achievements
    const updatedAchievements = checkAchievements(expenses, savingsGoals, budgetLimits, user.achievements);
    
    // Check for newly unlocked achievements
    const newlyUnlockedIds = updatedAchievements
      .filter(achievement => achievement.isUnlocked && !user.achievements.find(a => a.id === achievement.id)?.isUnlocked)
      .map(achievement => achievement.id);

    if (newlyUnlockedIds.length > 0) {
      setNewlyUnlocked(newlyUnlockedIds);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      newlyUnlockedIds.forEach(id => {
        const achievement = updatedAchievements.find(a => a.id === id);
        if (achievement) {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`);
        }
      });
    }

    setAchievements(updatedAchievements);
    
    // Update user data
    const updatedUser = {
      ...user,
      achievements: updatedAchievements,
      streaks,
    };
    storage.saveUser(updatedUser);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star size={16} />;
      case 'rare': return <Star size={16} />;
      case 'epic': return <Award size={16} />;
      case 'legendary': return <Trophy size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'streak': return <Flame size={24} className="text-orange-500" />;
      case 'savings': return <Target size={24} className="text-green-500" />;
      case 'budget': return <TrendingUp size={24} className="text-blue-500" />;
      case 'no_spend': return <Calendar size={24} className="text-purple-500" />;
      case 'goal': return <Trophy size={24} className="text-yellow-500" />;
      case 'milestone': return <Zap size={24} className="text-indigo-500" />;
      default: return <Star size={24} className="text-gray-500" />;
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Achievements & Progress</h2>
        <p className="text-gray-600">Track your financial journey milestones</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <Trophy size={24} className="text-yellow-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {unlockedCount}/{totalCount}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
            <Flame size={24} className="text-orange-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {streakData?.currentStreak || 0}
            </div>
            <p className="text-sm text-gray-600">Days of tracking</p>
            {streakData && streakData.longestStreak > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Best: {streakData.longestStreak} days
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">No Spend Days</h3>
            <Calendar size={24} className="text-purple-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {streakData?.noSpendDays || 0}
            </div>
            <p className="text-sm text-gray-600">Days without spending</p>
            {streakData && streakData.currentNoSpendStreak > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Current streak: {streakData.currentNoSpendStreak} days
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
          <p className="text-gray-600">Complete challenges to unlock achievements</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-lg border transition-all duration-300 ${
                  achievement.isUnlocked
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                } ${
                  newlyUnlocked.includes(achievement.id)
                    ? 'animate-pulse ring-2 ring-yellow-400'
                    : ''
                }`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                    {getRarityIcon(achievement.rarity)}
                    {achievement.rarity}
                  </span>
                </div>

                {/* Achievement Icon */}
                <div className="flex items-center gap-3 mb-3">
                  {getAchievementIcon(achievement.type)}
                  <div>
                    <h4 className={`font-semibold ${
                      achievement.isUnlocked ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    achievement.isUnlocked ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Unlock Animation */}
                {achievement.isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-0 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak Details */}
      {streakData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Streak Details</h3>
            <p className="text-gray-600">Your tracking and spending patterns</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {streakData.currentStreak}
                </div>
                <p className="text-sm text-gray-600">Current Streak</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {streakData.longestStreak}
                </div>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {streakData.noSpendDays}
                </div>
                <p className="text-sm text-gray-600">No Spend Days</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {streakData.currentNoSpendStreak}
                </div>
                <p className="text-sm text-gray-600">Current No Spend</p>
              </div>
            </div>
            
            {streakData.lastSpendDate && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last spending:</strong> {new Date(streakData.lastSpendDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips to Unlock More Achievements</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Track expenses daily to build your streak</li>
          <li>• Set and complete savings goals</li>
          <li>• Try to have "no spend days" regularly</li>
          <li>• Stay within your budget limits</li>
          <li>• Review your spending patterns weekly</li>
        </ul>
      </div>
    </div>
  );
};

export default Gamification; 