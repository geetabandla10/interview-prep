const prisma = require('../utils/prisma');

/**
 * Fetches all registered users with their session statistics.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { sessions: true }
        },
        sessions: {
          select: { totalScore: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format for easier frontend usage
    const formattedUsers = users.map(user => {
      const totalSessions = user._count.sessions;
      const avgScore = totalSessions > 0
        ? (user.sessions.reduce((sum, s) => sum + s.totalScore, 0) / totalSessions).toFixed(1)
        : '0.0';
      
      const { sessions, ...userData } = user;
      return { ...userData, totalSessions, avgScore };
    });

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch user management data' });
  }
};

/**
 * Aggregates global performance stats for Recharts visualization.
 */
const getGlobalStats = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, totalScore: true }
    });

    // Group by date
    const statsMap = sessions.reduce((acc, session) => {
      const date = new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, count: 0, totalScore: 0 };
      }
      acc[date].count += 1;
      acc[date].totalScore += session.totalScore;
      return acc;
    }, {});

    const chartData = Object.values(statsMap).map(item => ({
      date: item.date,
      sessions: item.count,
      avgScore: parseFloat((item.totalScore / item.count).toFixed(1))
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global analytics' });
  }
};

module.exports = {
  getAllUsers,
  getGlobalStats
};
