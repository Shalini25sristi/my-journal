const DEFAULT_PAGES = [
    {
        pageId: 'rate-my-day',
        name: '⭐ Rate My Day',
        options: [
            { value: '1', label: '1★', bg: '#ff8fa3', color: '#ffffff' },
            { value: '2', label: '2★', bg: '#ffb480', color: '#ffffff' },
            { value: '3', label: '3★', bg: '#ffe066', color: '#5d4e6d' },
            { value: '4', label: '4★', bg: '#8ce99a', color: '#2b5a34' },
            { value: '5', label: '5★', bg: '#b197fc', color: '#ffffff' }
        ]
    },
    {
        pageId: 'mood',
        name: '😊 Mood',
        options: [
            { value: 'amazing', label: 'Amazing', bg: '#06d6a0', color: '#ffffff' },
            { value: 'good', label: 'Good', bg: '#8ce99a', color: '#2b5a34' },
            { value: 'okay', label: 'Okay', bg: '#ffe066', color: '#5d4e6d' },
            { value: 'low', label: 'Low', bg: '#ff9f68', color: '#ffffff' },
            { value: 'bad', label: 'Bad', bg: '#e85d75', color: '#ffffff' }
        ]
    },
    {
        pageId: 'health',
        name: '❤️ Health',
        options: [
            { value: 'great', label: 'Great', bg: '#06d6a0', color: '#ffffff' },
            { value: 'good', label: 'Good', bg: '#8ce99a', color: '#2b5a34' },
            { value: 'tired', label: 'Tired', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'sick', label: 'Sick', bg: '#ef476f', color: '#ffffff' },
            { value: 'pain', label: 'Pain', bg: '#ffcdb2', color: '#5d4e6d' }
        ]
    },
    {
        pageId: 'sleep',
        name: '🌙 Sleep',
        options: [
            { value: 'good', label: 'Good Sleep', bg: '#118ab2', color: '#ffffff' },
            { value: 'okay', label: 'Okay Sleep', bg: '#06b6d4', color: '#ffffff' },
            { value: 'bad', label: 'Bad Sleep', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'insomnia', label: 'Insomnia', bg: '#ef476f', color: '#ffffff' },
            { value: 'overslept', label: 'Overslept', bg: '#ff9f68', color: '#ffffff' }
        ]
    },
    {
        pageId: 'productivity',
        name: '✅ Productivity',
        options: [
            { value: 'very-productive', label: 'Very Productive', bg: '#06d6a0', color: '#ffffff' },
            { value: 'productive', label: 'Productive', bg: '#8ce99a', color: '#2b5a34' },
            { value: 'some-progress', label: 'Some Progress', bg: '#ffe066', color: '#5d4e6d' },
            { value: 'unproductive', label: 'Unproductive', bg: '#ff9f68', color: '#ffffff' },
            { value: 'rest-day', label: 'Rest Day', bg: '#64748b', color: '#ffffff' }
        ]
    },
    {
        pageId: 'reading',
        name: '📖 Reading',
        options: [
            { value: 'book', label: 'Book', bg: '#118ab2', color: '#ffffff' },
            { value: 'article', label: 'Article', bg: '#10b981', color: '#ffffff' },
            { value: 'audiobook', label: 'Audiobook', bg: '#f59e0b', color: '#ffffff' },
            { value: 'manga', label: 'Manga / Comics', bg: '#ec4899', color: '#ffffff' },
            { value: 'none', label: 'Didn\'t Read', bg: '#64748b', color: '#ffffff' }
        ]
    },
    {
        pageId: 'self-care',
        name: '🛁 Self Care',
        options: [
            { value: 'skincare', label: 'Skincare', bg: '#ffd166', color: '#5d4e6d' },
            { value: 'haircare', label: 'Haircare', bg: '#343a40', color: '#ffffff' },
            { value: 'bodycare', label: 'Bodycare', bg: '#06d6a0', color: '#ffffff' },
            { value: 'relaxation', label: 'Relaxation', bg: '#b197fc', color: '#ffffff' },
            { value: 'none', label: 'None', bg: '#ffcdb2', color: '#5d4e6d' }
        ]
    }
];

module.exports = { DEFAULT_PAGES };
