export const categoryBySection = {
  news: [
    {
      slug: 'world_news',
      title: 'World News',
      icon: 'globe-outline',
    },
    {
      slug: 'us_news',
      title: 'US News',
      icon: 'book-outline',
    },
    {
      slug: 'business',
      title: 'Business',
      icon: 'briefcase-outline',
    },

    {
      slug: 'tech',
      title: 'Technology',
      icon: 'hardware-chip-outline',
    },
    // {
    //   slug: 'economy',
    //   title: 'Economy',
    //   icon: 'cash-outline',
    // },
    // {
    //   slug: 'finance',
    //   title: 'Finance',
    //   icon: 'cash-outline',
    // },
    // {
    //   slug: 'environment',
    //   title: 'Environment',
    //   icon: 'leaf-outline',
    // },
    {
      slug: 'politics',
      title: 'Politics',
      icon: 'flag-outline',
    },
    // {
    //   slug: 'investing',
    //   title: 'Investing',
    //   icon: 'cash-outline',
    // },
    {
      slug: 'science',
      title: 'Science',
      icon: 'flask-outline',
    }
  ],
  work: [
    {
      slug: 'medicine',
      title: 'Medicine',
      icon: 'medical-outline',
    },
    // {
    //   slug: 'real_estate',
    //   title: 'Real Estate',
    //   icon: 'home-outline',
    // },
    // {
    //   slug: 'legal',
    //   title: 'Legal',
    //   icon: 'library-outline',
    // },
    {
      slug: 'marketing',
      title: 'Marketing',
      icon: 'megaphone-outline',
    },
    {
      slug: 'leadership',
      title: 'Leadership',
      icon: 'people-outline',
    },
    // {
    //   slug: 'entrepreneurship',
    //   title: 'Entrepreneurship',
    //   icon: 'business-outline',
    // }
  ],
  fun: [
    {
      slug: 'entertainment',
      title: 'Entertainment',
      icon: 'film-outline',
    },
    {
      slug: 'sports',
      title: 'Sports',
      icon: 'football-outline',
    },
    // {
    //   slug: 'lifestyle',
    //   title: 'Lifestyle',
    //   icon: 'bulb-outline',
    // },
    {
      slug: 'travel',
      title: 'Travel',
      icon: 'airplane-outline',
    },
    {
      slug: 'gaming',
      title: 'Gaming',
      icon: 'game-controller-outline',
    },
    // {
    //   slug: 'space',
    //   title: 'Space',
    //   icon: 'planet-outline',
    // },
    {
      slug: 'history',
      title: 'History',
      icon: 'book-outline',
    },
    // {
    //   slug: 'arts-culture',
    //   title: 'Arts & Culture',
    //   icon: 'color-palette-outline',
    // },
  ]
}

export const categories = categoryBySection.news.concat(categoryBySection.work).concat(categoryBySection.fun)
