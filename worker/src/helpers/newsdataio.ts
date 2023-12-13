import axios from 'axios';
interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  video_url: string | null;
  description: string;
  content: string;
  pubDate: string;
  image_url: string;
  source_id: string;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
}

export const getNews = async (query: string): Promise<NewsResponse> => {
  const baseURL = "https://newsdata.io/api/1/news";

  const response = await axios.get<NewsResponse>(baseURL, {
    params: {
      apikey: process.env.NEWS_DATA_IO_API_KEY,
      q: query,
      country: 'us',
      language: 'en'
    }
  });

  return response.data;
};

export const formatResponse = (response: NewsResponse) => {
  const { results } = response;
  return results.map((article) => ({
    title: article.title,
    url: article.link,
    source: article.source_id,
    publishedAt: article.pubDate,
    content: article.content,
    category: article.category,
    image: article.image_url,
  }));
}


// https://newsdata.io/api/1/news?apikey=REDACTED_NEWSDATA_API_KEY&q=baseball&country=us&language=en
// {
//   "status": "success",
//   "totalResults": 32,
//   "results": [
//   {
//   "article_id": "d5b946a531b931caa32e3c4449daaf20",
//   "title": "Oakland Is Getting a New Minor League Team — The Oakland B’s",
//   "link": "https://gvwire.com/2023/11/28/oakland-is-getting-a-new-minor-league-team-the-oakland-bs/?utm_source=rss&utm_medium=rss&utm_campaign=oakland-is-getting-a-new-minor-league-team-the-oakland-bs",
//   "keywords": [
//   "California",
//   "Sports"
//   ],
//   "creator": [
//   "Associated Press"
//   ],
//   "video_url": null,
//   "description": "OAKLAND — They will call themselves the Oakland B’s, short for Ballers. The minor league B’s will carry on the city’s green-and-gold color scheme. Otherwise, they don’t plan to be anything like the A’s, whose heartbroken fans they hope to support through the team’s painful departure for Las Vegas. The B’s promise to never leave town. […] The post Oakland Is Getting a New Minor League Team — The Oakland B’s first appeared on GV Wire - Explore. Explain. Expose.",
//   "content": "OAKLAND — They will call themselves the Oakland B’s, short for Ballers. The minor league B’s will carry on the city’s green-and-gold color scheme. Otherwise, they don’t plan to be anything like the A’s, whose heartbroken fans they hope to support through the team’s . The B’s promise to never leave town. Plans for the New Team The expansion independent club announced plans Tuesday to begin play in the Pioneer League come May of 2024, with their first home games set for July at Laney College. The intent is to keep baseball alive in Oakland for years to come. Major League Baseball team owners unanimously approved the Athletics’ move to Las Vegas earlier this month. The A’s will play at the Oakland Coliseum through the end of their lease next year and could be gone by 2025. The Ballers expect to fill at least some of that void. Entrepreneurs and co-founders Bryan Carmel and Paul Freedman are putting the team in the hands of former big league manager Don Wakamatsu, who has deep Northern California ties. “The idea of actually starting an independent franchise in Oakland really intrigued me,” said Wakamatsu, a native of nearby Hayward hired earlier this fall as the B’s executive vice president of baseball operations. “It gives me an opportunity to kind of build something from the ground up. I have a real strong history in the Bay Area with players.” Building the Team Wakamatsu has already signed nine players, with a roster of 35 to be constructed for the start of spring training in May. And Wakamatsu has a manager in place — San Francisco native and former player Micah Franklin, joined by retired left-hander Ray King as pitching coach. Wakamatsu himself played in the Pioneer League, heading from Arizona State directly to Billings, Montana. He became baseball’s first Asian-American big league manager in 2008 and was most recently the Texas Rangers bench coach in 2021. Baseball in the East Bay means so much to Wakamatsu — who has spent the past few years focusing on his non-profit educational organization that helps athletes give back in their communities — that it didn’t take a huge sell convincing him to commit. His first game as a fan was at the Coliseum in 1972 and influenced his career path into baseball. “I found it exciting to kind of thinking outside the box of how can we do something in the city of Oakland, how we can build something, especially with the timing of (the A’s) leaving,” Wakamatsu said. Support from the Community Carmel and Freedman were already discussing how they might help A’s fans when they were struck by a spirited at the Coliseum on June 13 that attracted a season-best crowd of 27,759. “That was amazing. And the moment of silence in the fifth inning, I had goosebumps,” Freedman recalled. “That activism, that inspiration, that demonstration of just what a strong fan base was part of the reason. “Bryan and I were already contemplating it, but after that it was like, ‘We cannot let this legacy of baseball end in Oakland. It’s too beautiful, it’s too intertwined with the city of Oakland. And regardless of what the A’s are going to do, we can’t let that legacy end and we have to do something about it.’” Before the A’s move was approved Nov. 16, Freedman and Carmel were working behind the scenes on the B’s, including coordination . Funding and Future Plans The Ballers have raised $2 million in seed funding from dozens of diverse investors. Now, they will invite anyone to contribute to the early campaign through a crowd-funding platform for the chance at an ownership stake. “We just started thinking: ‘Where will this go? This can’t be the end of the story, and so what is a new chapter for baseball in Oakland?’” Carmel said. Carmel and Freedman feared if they didn’t act immediately, the Bay Area would lose a huge number of its baseball fans, who would be bitter about the A’s leaving and never come back to the sport. “We don’t want that to happen, we love baseball, we think that there’s a place for it,” Carmel said. “And so the idea is let’s give an alternative, let’s give everybody a new team to root for and to come together for.” The Ballers will feature a familiar look, with a “B” logo in a nearly identical font to the Athletics’ iconic “A.” The team will become the first Pioneer League franchise in California, set to play 48 home games in a 96-game schedule at Laney College, about five miles north of the dilapidated Coliseum. Plans are underway to upgrade the Laney ballpark to hold upwards of about 3,000 fans. The venue underwent a renovation about 10 years ago, and an architect from a previous athletic project at the school will be involved again. Related Story: Belief in Oakland Carmel and Freedman were frustrated at the chatter questioning whether Oakland could any longer be a professional sports city after the Raiders left for Las Vegas and the Golden State Warriors moved across the bay to San Francisco — “and we just reject that sentiment,” Carmel said. “We have a core belief that sports franchises belong to communities and that that’s really the value in that relationship,” Carmel said. “… That’s a lot of why we’re doing this. Oakland is an underdog city, we’re an underdog organization. Is it a major league baseball team? No. We’re in the Pioneer League, it’s an innovation league, it’s a development league. “We think that that’s great. There’s nothing more Oakland than starting something from scratch and building it from the ground up with the community. And so we don’t see that as a weakness, we see that as a strength that we’re only going to build and get bigger.”",
//   "pubDate": "2023-11-28 17:49:32",
//   "image_url": "https://gvwire.s3.us-west-1.amazonaws.com/wp-content/uploads/2023/11/01141954/23-CHS-3572-LinkedIn_Wade-Family_300x250.jpg",
//   "source_id": "gvwire",
//   "source_priority": 129134,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "sports"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "c4b6314c12946c8fbef9b084c4a6396b",
//   "title": "Report: Red Sox free agent target Jordan Montgomery is spending his offseason in Boston",
//   "link": "https://www.boston.com/sports/boston-red-sox/2023/11/28/boston-red-sox-jordan-montgomery-free-agency/",
//   "keywords": [
//   "Sports",
//   "Baseball",
//   "MLB",
//   "Red Sox",
//   "Sports News"
//   ],
//   "creator": [
//   "Luke Scotchie"
//   ],
//   "video_url": null,
//   "description": "Montgomery’s wife, McKenzie, is starting a dermatology residency at an area hospital. The pitcher reportedly moved to the city to live with her. The post Report: Red Sox free agent target Jordan Montgomery is spending his offseason in Boston appeared first on Boston.com.",
//   "content": "By The would benefit from signing a free agent starting pitcher this winter. They won’t have to travel too far to meet with one of them. According to , is living in Boston for the offseason and has recently been working out and throwing at . Montgomery’s wife, McKenzie, is starting a dermatology residency at an area hospital and the pitcher reportedly moved to the city to live with her. Montgomery, who recently helped the , is one of the premier free agents in this year’s class. He’s also one of the few top free agent starters to not have a qualifying offer attached to him, meaning that any team can sign him without having to give up draft compensation. For those reasons, in addition to fellow starters and Sonny Gray no longer being available to sign, it’s almost certain that Montgomery will have plenty of interested suitors. Signing Montgomery would certainly be a massive boon for the Red Sox’ currently-questionable rotation. The southpaw pitched for both the St. Louis Cardinals and the Rangers last season, registering a 3.20 ERA and a 1.193 WHIP with 166 strikeouts in 188.2 innings. He was a massive part of the Rangers’ World Series victory, shutting down the then-reigning champions Houston Astros in Game 1 of the ALCS and even pitching in the Fall Classic itself. The Red Sox have expressed interest in Montgomery over the past month. They reportedly have talked to his agent and are to prefer him over several other free agent starters. And if Montgomery, a native of South Carolina, decides he likes Boston after getting a chance to experience living in the city, that interest could possibly end up becoming mutual. Cotillo and McAdam said Montgomery’s decision to move to Boston had nothing to do with possibly joining the Red Sox and was made primarily so he could live with his wife during her residency. But they also noted that if his wife needs to stay in Boston for a few years or if he grows fond of the city, he could be convinced to pitch his home games at . It’s not yet clear if there is any traction, or even meaningful conversation, between the Red Sox and Montgomery. But that could change if the new Boston resident decides Eastern Massachusetts is the best fit for him and his family going forward. Get breaking news and analysis delivered to your inbox during baseball season. Be civil. Be kind.",
//   "pubDate": "2023-11-28 17:31:42",
//   "image_url": "https://www.boston.com/wp-content/themes/bdc-2020/images/tease-defaults/fallback-tease-image-4x3-medium.png",
//   "source_id": "bostonglobe",
//   "source_priority": 2335,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "top"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "0dd6c08dd94c5558674f2bf33e17b765",
//   "title": "Oakland is getting a new minor league team — the Oakland B’s",
//   "link": "https://www.eastbaytimes.com/2023/11/28/oakland-is-getting-a-new-minor-league-team-the-oakland-bs/",
//   "keywords": [
//   "Business",
//   "California News",
//   "Latest Headlines",
//   "Local News",
//   "MLB",
//   "News",
//   "Oakland Athletics",
//   "Sports",
//   "Major League Baseball",
//   "Morning Wire",
//   "Oakland Athletics stadium",
//   "Sports Wire"
//   ],
//   "creator": [
//   "Associated Press"
//   ],
//   "video_url": null,
//   "description": "Oakland is getting a new minor league baseball team, the Oakland B's. The expansion independent club announced plans Tuesday to begin play in the Pioneer League come May of 2024, with its first home games set for July at Laney College.",
//   "content": "By JANIE McCAULEY (AP Baseball Writer) OAKLAND, Calif. (AP) — They will call themselves the Oakland B’s, short for Ballers. The minor league B’s will carry on the city’s green-and-gold color scheme. Otherwise, they don’t plan to be anything like the A’s, whose heartbroken fans they hope to support through the team’s painful departure for Las Vegas. The B’s promise to never leave town. The expansion independent club announced plans Tuesday to begin play in the Pioneer League come May of 2024, with their first home games set for July at Laney College. The intent is to keep baseball alive in Oakland for years to come. Major League Baseball team owners unanimously approved the Athletics’ move to Las Vegas earlier this month. The A’s will play at the Oakland Coliseum through the end of their lease next year and could be gone by 2025. The Ballers expect to fill at least some of that void. Entrepreneurs and co-founders Bryan Carmel and Paul Freedman are putting the team in the hands of former big league manager Don Wakamatsu, who has deep Northern California ties. “The idea of actually starting an independent franchise in Oakland really intrigued me,” said Wakamatsu, a native of nearby Hayward hired earlier this fall as the B’s executive vice president of baseball operations. “It gives me an opportunity to kind of build something from the ground up. I have a real strong history in the Bay Area with players.” Wakamatsu has already signed nine players, with a roster of 35 to be constructed for the start of spring training in May. And Wakamatsu has a manager in place — San Francisco native and former player Micah Franklin, joined by retired left-hander Ray King as pitching coach. Wakamatsu himself played in the Pioneer League, heading from Arizona State directly to Billings, Montana. He became baseball’s first Asian-American big league manager in 2008 and was most recently the Texas Rangers bench coach in 2021. Baseball in the East Bay means so much to Wakamatsu — who has spent the past few years focusing on his non-profit educational organization that helps athletes give back in their communities — that it didn’t take a huge sell convincing him to commit. His first game as a fan was at the Coliseum in 1972 and influenced his career path into baseball. “I found it exciting to kind of thinking outside the box of how can we do something in the city of Oakland, how we can build something, especially with the timing of (the A’s) leaving,” Wakamatsu said. Carmel and Freedman were already discussing how they might help A’s fans when they were struck by a spirited “reverse boycott” at the Coliseum on June 13 that attracted a season-best crowd of 27,759. “That was amazing. And the moment of silence in the fifth inning, I had goosebumps,” Freedman recalled. “That activism, that inspiration, that demonstration of just what a strong fan base was part of the reason. “Bryan and I were already contemplating it, but after that it was like, ‘We cannot let this legacy of baseball end in Oakland. It’s too beautiful, it’s too intertwined with the city of Oakland. And regardless of what the A’s are going to do, we can’t let that legacy end and we have to do something about it.’” Before the A’s move was approved Nov. 16, Freedman and Carmel were working behind the scenes on the B’s, including coordination with fan groups that pushed to keep the low-budget club in Oakland. The Ballers have raised $2 million in seed funding from dozens of diverse investors. Now, they will invite anyone to contribute to the early campaign through a crowd-funding platform for the chance at an ownership stake. “We just started thinking: ‘Where will this go? This can’t be the end of the story, and so what is a new chapter for baseball in Oakland?’” Carmel said. Carmel and Freedman feared if they didn’t act immediately, the Bay Area would lose a huge number of its baseball fans, who would be bitter about the A’s leaving and never come back to the sport. “We don’t want that to happen, we love baseball, we think that there’s a place for it,” Carmel said. “And so the idea is let’s give an alternative, let’s give everybody a new team to root for and to come together for.” The Ballers will feature a familiar look, with a “B” logo in a nearly identical font to the Athletics’ iconic “A.” The team will become the first Pioneer League franchise in California, set to play 48 home games in a 96-game schedule at Laney College, about five miles north of the dilapidated Coliseum. Related Articles Plans are underway to upgrade the Laney ballpark to hold upwards of about 3,000 fans. The venue underwent a renovation about 10 years ago, and an architect from a previous athletic project at the school will be involved again. Carmel and Freedman were frustrated at the chatter questioning whether Oakland could any longer be a professional sports city after the Raiders left for Las Vegas and the Golden State Warriors moved across the bay to San Francisco — “and we just reject that sentiment,” Carmel said. “We have a core belief that sports franchises belong to communities and that that’s really the value in that relationship,” Carmel said. “… That’s a lot of why we’re doing this. Oakland is an underdog city, we’re an underdog organization. Is it a major league baseball team? No. We’re in the Pioneer League, it’s an innovation league, it’s a development league. “We think that that’s great. There’s nothing more Oakland than starting something from scratch and building it from the ground up with the community. And so we don’t see that as a weakness, we see that as a strength that we’re only going to build and get bigger.” ___ AP MLB: https://apnews.com/hub/MLB",
//   "pubDate": "2023-11-28 17:30:37",
//   "image_url": "https://www.eastbaytimes.com/wp-content/uploads/2023/11/Oaklands_New_Team_Baseball_37835.jpg?w=1400px&strip=all",
//   "source_id": "eastbaytimes",
//   "source_priority": 17164,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "top"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "41284ae942dce1e3e4b8c15161af7a90",
//   "title": "Oakland is getting a new baseball team — the minor league Oakland B’s",
//   "link": "https://www.mercurynews.com/2023/11/28/oakland-is-getting-a-new-minor-league-team-the-oakland-bs/",
//   "keywords": [
//   "Business",
//   "California News",
//   "Latest Headlines",
//   "MLB",
//   "News",
//   "Oakland Athletics",
//   "Sports",
//   "Inside Sports",
//   "Oakland Athletics stadium"
//   ],
//   "creator": [
//   "Associated Press"
//   ],
//   "video_url": null,
//   "description": "Oakland is getting a new minor league baseball team, the Oakland B's. The expansion independent club announced plans Tuesday to begin play in the Pioneer League come May of 2024, with its first home games set for July at Laney College.",
//   "content": "OAKLAND — They will call themselves the Oakland B’s, short for Ballers. The minor league B’s will carry on the city’s green-and-gold color scheme. Otherwise, they don’t plan to be anything like the A’s, whose heartbroken fans they hope to support through the team’s painful departure for Las Vegas. The B’s promise to never leave town. The expansion independent club announced plans Tuesday to begin play in the Pioneer League come May of 2024, with their first home games set for July at Laney College. The intent is to keep baseball alive in Oakland for years to come. Major League Baseball team owners unanimously approved the Athletics’ move to Las Vegas earlier this month. The A’s will play at the Oakland Coliseum through the end of their lease next year and could be gone by 2025. The Ballers expect to fill at least some of that void. Entrepreneurs and co-founders Bryan Carmel and Paul Freedman are putting the team in the hands of former big league manager Don Wakamatsu, who has deep Northern California ties. “The idea of actually starting an independent franchise in Oakland really intrigued me,” said Wakamatsu, a native of nearby Hayward hired earlier this fall as the B’s executive vice president of baseball operations. “It gives me an opportunity to kind of build something from the ground up. I have a real strong history in the Bay Area with players.” Wakamatsu has already signed nine players, with a roster of 35 to be constructed for the start of spring training in May. And Wakamatsu has a manager in place — San Francisco native and former player Micah Franklin, joined by retired left-hander Ray King as pitching coach. Wakamatsu himself played in the Pioneer League, heading from Arizona State directly to Billings, Montana. He became baseball’s first Asian-American big league manager in 2008 and was most recently the Texas Rangers bench coach in 2021. Baseball in the East Bay means so much to Wakamatsu — who has spent the past few years focusing on his non-profit educational organization that helps athletes give back in their communities — that it didn’t take a huge sell convincing him to commit. His first game as a fan was at the Coliseum in 1972 and influenced his career path into baseball. “I found it exciting to kind of thinking outside the box of how can we do something in the city of Oakland, how we can build something, especially with the timing of (the A’s) leaving,” Wakamatsu said. Carmel and Freedman were already discussing how they might help A’s fans when they were struck by a spirited “reverse boycott” at the Coliseum on June 13 that attracted a season-best crowd of 27,759. “That was amazing. And the moment of silence in the fifth inning, I had goosebumps,” Freedman recalled. “That activism, that inspiration, that demonstration of just what a strong fan base was part of the reason. “Bryan and I were already contemplating it, but after that it was like, ‘We cannot let this legacy of baseball end in Oakland. It’s too beautiful, it’s too intertwined with the city of Oakland. And regardless of what the A’s are going to do, we can’t let that legacy end and we have to do something about it.’” Before the A’s move was approved Nov. 16, Freedman and Carmel were working behind the scenes on the B’s, including coordination with fan groups that pushed to keep the low-budget club in Oakland. The Ballers have raised $2 million in seed funding from dozens of diverse investors. Now, they will invite anyone to contribute to the early campaign through a crowd-funding platform for the chance at an ownership stake. “We just started thinking: ‘Where will this go? This can’t be the end of the story, and so what is a new chapter for baseball in Oakland?’” Carmel said. Carmel and Freedman feared if they didn’t act immediately, the Bay Area would lose a huge number of its baseball fans, who would be bitter about the A’s leaving and never come back to the sport. “We don’t want that to happen, we love baseball, we think that there’s a place for it,” Carmel said. “And so the idea is let’s give an alternative, let’s give everybody a new team to root for and to come together for.” The Ballers will feature a familiar look, with a “B” logo in a nearly identical font to the Athletics’ iconic “A.” The team will become the first Pioneer League franchise in California, set to play 48 home games in a 96-game schedule at Laney College, about five miles north of the dilapidated Coliseum. Plans are underway to upgrade the Laney ballpark to hold upwards of about 3,000 fans. The venue underwent a renovation about 10 years ago, and an architect from a previous athletic project at the school will be involved again. Carmel and Freedman were frustrated at the chatter questioning whether Oakland could any longer be a professional sports city after the Raiders left for Las Vegas and the Golden State Warriors moved across the bay to San Francisco — “and we just reject that sentiment,” Carmel said. “We have a core belief that sports franchises belong to communities and that that’s really the value in that relationship,” Carmel said. “… That’s a lot of why we’re doing this. Oakland is an underdog city, we’re an underdog organization. Is it a major league baseball team? No. We’re in the Pioneer League, it’s an innovation league, it’s a development league. “We think that that’s great. There’s nothing more Oakland than starting something from scratch and building it from the ground up with the community. And so we don’t see that as a weakness, we see that as a strength that we’re only going to build and get bigger.” ___ AP MLB: https://apnews.com/hub/MLB",
//   "pubDate": "2023-11-28 17:24:37",
//   "image_url": "https://www.mercurynews.com/wp-content/uploads/2023/11/Oaklands_New_Team_Baseball_37835.jpg?w=1400px&strip=all",
//   "source_id": "mercurynews",
//   "source_priority": 2968,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "business"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "1001c8ed516ffd278c71a089bd5174a1",
//   "title": "Three moves the Reds should make this offseason: Acquire an ace, replace Jonathan India with a slugging DH",
//   "link": "\n                                                https://www.cbssports.com/mlb/news/three-moves-the-reds-should-make-this-offseason-acquire-an-ace-replace-jonathan-india-with-a-slugging-dh/\n                    ",
//   "keywords": null,
//   "creator": [
//   "Matt Snyder"
//   ],
//   "video_url": null,
//   "description": "The Reds were surprise contenders last season and now it's time to capitalize and make the 2024 playoffs",
//   "content": "For a stretch in 2023, the best story in baseball was the oldest professional team: The . The Reds were actually one of baseball's youngest teams in 2023. Riding a wave of successful rookie seasons -- such as those from , and -- the upstart Reds contended for a playoff spot just one year after losing 100 games. Faltering down the stretch and missing the playoffs after leading the NL Central as late as Aug. 2 had to be disappointing, but they won exactly 20 more games in 2023 than in 2022. There's a strong foundation for the future, too, so the Reds need to have a big offseason to supplement the talent and make their first full-season playoffs since 2013. There's good news for Reds fans hoping for a splash this offseason: Money shouldn't be a concern. The only significant salary on the books past 2024 is and it's not a huge contract (six years and $53 million). Right now, the Reds are looking at an estimated $67.4 million in player salary heading toward 2024, per baseball-reference.com. For reference, they've been over $135 million before. This doesn't necessarily mean they can spend all the way up to $135 million -- which would give them more $65 million to play with this offseason -- but there's certainly room to add. The position-player group appears to be in pretty good shape. De La Cruz only played in 98 games, McLain 89 and , who flashed nice upside, only played in 63. Another highly-touted prospect, Noelvi Marté, saw action in just 35 games during which he hit .316/.366/.456. The Reds were fifth in the NL in runs and OPS last season and it seems like -- even if they don't upgrade from outside the organization -- they already have a good offense in place. There should still be movement, though. The infield is full of players heading to their second year: Encarnacion-Strand at first, McLain at second, De La Cruz at shortstop and Marté at third. That enables the Reds to use along with , and in the outfield. doesn't hit well enough to DH, so he's trade bait and that's been the word there for a while, to the point that he's unlikely to hit Opening Day in a Cincinnati jersey. The pitching end is where much of the discussion for offseason moves should take place. The Reds were 13th in the NL in ERA, ahead of only the and . Young Hunter Greene isn't going anywhere and still has lots of unrealized promise. Abbott had an excellent rookie year and had a 2.58 ERA in his last 12 starts. They could round out the rotation right now with and and hope everything works out. That's not how a contender operates, though. Abbott and Ashcraft are more mid-rotation starters on a contender and Greene is still a bit of a wild card. Williamson could be a fine fifth starter and Lodolo is probably more of a wild card than Greene now after 2023. A veteran stud atop the rotation would sure be nice. The Reds already missed out on , though reports indicated they were in on the bidding and that's a good sign. Let's start there. At present, the Reds have a collection of interesting arms but none come close to being a frontline starter at this point. Maybe Greene or Lodolo or Abbott get there someday, but the Reds are trying to win the NL Central, not just hope something clicks. They were recently rumored to be talking with the about a possible trade for and now we're talking. Glasnow returned from Tommy John surgery late in 2022 and then had a spring training injury delay his 2023 season. Eventually, he made 21 starts and pitched to a 3.53 ERA and 1.08 WHIP with 162 strikeouts in 120 innings. Another season removed from the surgery and now heading to his age-30 season, he might be ready to finally bust out into All-Star form for a full season after showing glimpses of it in 2019, 2021 and some last season. I'd call it a good bet. If not Glasnow, is known to be on the trading block and would be a nice fit. Or perhaps the Reds turn to free agency. I already mentioned that they were reportedly in on Gray. Lefty might've pitched himself out of the Reds' price range in the playoffs, but maybe there's a chance they can land him. He'd be a nice get. What about Eduardo Rodríguez? Like Montgomery, he's not attached to a qualifying offer. The lefty exercised his no-trade clause last July because he didn't want to uproot his family to move to Los Angeles, but Cincinnati is close enough to Detroit that he should be fine with the destination. Rodríguez had a 3.30 ERA with 143 strikeouts in 152 2/3 innings last year. I'm also intrigued by . He had a miserable 2023 season after the traded him. He had a 6.89 ERA in six starts for the and 7.04 ERA in six starts for the . It's possible he'll look for a one-year deal to re-establish his value (such as did last season). If that's the case, the Reds should dive right in and take a shot. He could end up pitching like the guy who has gotten Cy Young votes in three different seasons. If the Reds could somehow swing deals for two of the pitchers mentioned above, that would be amazing. Signing Rodríguez and trading for Glasnow would make the rotation look something like this: That also leaves Lodolo and Williamson as the sixth and seventh starters and we know in this day and age you need to have plenty of capable arms. The rotation would still have plenty of question marks, but also a lot of chances to settle on a very good fivesome. Beyond Glasnow, Cease, Montgomery, Giolito and Rodríguez, the Reds could go deeper into the bargain bin for someone like , , the lottery ticket or even a reunion. The Reds need a lot of pitching this offseason. They'll need to add bullpen depth, but it has to begin with one pitcher who resembles a frontline starter and another who can serve as at least a mid-rotation man. As noted above, India is either a backup or a DH. They might as well just trade him for something like a bullpen arm. I wonder if the White Sox would trade Eloy Jiménez. The club on the South Side seems to be starting over and he's only signed through 2024 with team options for 2025 and 2026. That's the sort of contract that could be enticing to unload from the White Sox's perspective while also enticing for the Reds to add. Jiménez has trouble staying healthy, but he's still plenty capable of being a force and would make a nice fit in the middle of this lineup. In free agency, it couldn't hurt to kick the tires on , , or . Any of these power hitters would thrive in Great American Ball Park and would provide veteran -- and playoff battle-tested -- experience in the middle of a young batting order. If they prefer someone from the left side of the plate, or could work. If you were asking me for the Reds' ideal offseason within the parameters of being at least somewhat realistic, I'll go with trading for Tyler Glasnow, signing Eduardo Rodríguez and signing one of the possible DHs mentioned here. They can pull all of this off with prospect currency and by spending money that they can absolutely afford to spend.",
//   "pubDate": "2023-11-28 17:01:18",
//   "image_url": "https://sportshub.cbsistatic.com/i/2023/11/27/d52e3756-36ec-4057-b46b-f99742096d3f/glasnow-getty-1.png",
//   "source_id": "cbssports",
//   "source_priority": 72,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "top"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "0ce5e765671c5c6e832cbf2288c5e918",
//   "title": "Calling All ‘Sex and the City’ Fans: You Need This Miranda-Themed Sweatsuit",
//   "link": "https://www.vogue.com/article/rachel-antonoff-miranda-toile-interview",
//   "keywords": [
//   "Culture / TV & Movies",
//   "Fashion"
//   ],
//   "creator": [
//   "Stephanie Sporn"
//   ],
//   "video_url": null,
//   "description": "“My dream for any of our prints is that if you were on the subway and got stuck underground, you could possibly occupy yourself by looking at your own shirt,” says designer Rachel Antonoff.",
//   "content": "If you couldn’t help but wonder what would make the perfect gift this holiday season, Rachel Antonoff has you covered. The New York–based designer’s eponymous label—known for its amusing, whimsical motifs—has released its latest TV-inspired toile de Jouy print, and OG fans will feel all the nostalgia. Miranda Hobbes—everyone’s favorite sardonic redheaded corporate lawyer—stars in a , , and splashed with vignettes from some of her most memorable scenes, as illustrated by artist Hazel Lee Santino. In one, Miranda gives the infamous “eat me” sandwich a piece of her mind; in others, she locks lips with , dons bucket hats and Lasik-eye-surgery-recovery goggles, and perches beside a chocolate cake (an homage to her “Betty Crocker clinic” baking binge). “Miranda is really an unsung hero,” Antonoff tells , explaining why she gravitated toward Cynthia Nixon’s character out of the four leading ladies. “The way she talks, the clothes she wears—she’s so fascinatingly herself.” Below, the designer and TV aficionado discusses the making of the Miranda Toile, the joy of endlessly rewatching , and what it’s like “living in a full-blown nostalgia tornado all the time.” My inspiration comes from literally everywhere in the strangest ways. Growing up, my mom and I used to go on what she would call “feel runs,” meaning one person would run whichever way they felt in the moment. That’s kind of what my design process feels like. I can’t tell you the number of times an idea has come from the waiting room of a weird gynecologist’s office, something an annoying ex-boyfriend said to me, or something I’m eating. I feel like a detective constantly paying attention, looking for the next bizarre idea. They’re extremely autobiographical. They reflect how I see New York, having gone to school here, but with the twist of mostly having grown up in New Jersey and always feeling so close to the city but wanting to be there and finally getting to be. There’s a little bit of both sides and, of course, always celebrating New Jersey too. Before we went, we almost viewed the tour as something ironic or a joke. Then when you’re on it, it’s impossible to feel that way because there’s something so earnest about just being there. Most people were visiting New York for the first time, and it was such a cool feeling to think that we actually get to live in the museum of a city that these people are touring. I’ve always loved a toile. Quite a while ago, our team started to root ourselves in the conversation-print genre. My favorite kind of conversation print is one that continues to unfold. I always love when you’re wearing something and feel like you have a little secret, whether hidden in the lining of a garment or in the print itself. Toile is the ultimate opportunity to hide stories because there’s so much going on. My dream for any of our prints is that if you were on the subway and got stuck underground, you could possibly occupy yourself by looking at your own shirt. A few years ago, our team had wanted to do a straightforward, pretty toile, but because we often cannot contain the silliness in the office, we designed where naked men are running and hiding, and my dog Lafitte is also hidden in there. Our first TV-themed toile was , which features Tony Soprano. I have a lot of anxiety, and since childhood I’ve been really good at self-soothing, whether it’s through food or TV. TV is a massive part of my life, and I love great stories, like . People liked Tony’s Toile so much, we asked ourselves, What else can we do? Last year we introduced based on . has always been in our office zeitgeist. We quote it often, and it’s my personal background noise. You could write a big thesis about how wildly problematic it is, but at the same time, I think it brings a lot of comfort to a lot of people. I remember watching it at my sister’s shiva, and it was like a through line back to normalcy. When our team discussed making a toile, Miranda felt like the most obvious choice because of the four women, she feels the most human, and she has so many iconic moments. Several years ago we had a Halloween [party] in the office where the challenge was to dress up as your favorite Miranda. I showed up in the look where she wears a bucket hat over her hooded jacket because it’s truly one of the most We’ve been working on it for about a year. It was a team effort to work out our favorite scenes and determine the Easter eggs we were missing. I was so excited that somebody remembered the dancing frogs, which was the gift Miranda gave her decorator for her in season two. Honestly I’m probably like a —you know, a weird background player. But if I had to be one of the four, God, I hope I’m a Miranda. I would aspire to be a , but I probably am more of a Miranda. If we do another toile, Samantha will be next. That is genius! Also, James and his tiny penis. Sensational. Maybe that guy in the swing. Something with Richard. I feel like for we would deviate, and instead of focusing on scenes, maybe we would focus on puns, perhaps woven into the trees. If we were going for scenes, I always loved her at the baseball game with the new Yankee. Obviously the Carrie necklace would have to be woven throughout like ribbons in a toile. And the Berger Post-it. Art and Harry. Her getting drunk and dancing in Staten Island. Something with Trey—the cardboard baby! We’d have to have Bunny MacDougal and her keychain. So many opportunities for me! and and are hugely important to me, as are Leslie Nielsen and movies. But I don’t think I’m going to have customers for those. That is really a lovely part of this job. We all have our memories and our shared weird nostalgia crossovers. It’s nice to share that with strangers and build a community.",
//   "pubDate": "2023-11-28 14:00:00",
//   "image_url": "https://assets.vogue.com/photos/65649b374f8c693ef48f85d7/master/pass/MIRANDA%20TOILE_REVISED.jpg",
//   "source_id": "vogue",
//   "source_priority": 4162,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "entertainment"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "79baa7aafe779b30a30e3881154aa52d",
//   "title": "Inside Alessandro Michele’s Otherworldly Apartment in Rome",
//   "link": "https://www.vogue.com/article/alessandro-michele-apartment-rome",
//   "keywords": [
//   "Magazine"
//   ],
//   "creator": [
//   "Chiara Barzini"
//   ],
//   "video_url": null,
//   "description": "“I am a doctor for injured, dilapidated homes,” the former Gucci designer says.",
//   "content": "Alessandro Michele looks for a home in every city he visits, entertaining romantic visions for himself, and often following up on them. He has a particular love for faded beauties, run-down places brimming with history and lost grandeur—and this is why he has embarked on the quixotic endeavor of renovating one of the most iconic and mysterious buildings in Rome: Palazzo Scapucci. As a teenager in the early ’90s, Alessandro strolled the Eternal City with a solitary, focused look. Bright green hair held up in a mohawk, he was the only punk kid in his neighborhood. Merely standing at the bus stop was an adventure. He attended a conservative high school in the bourgeois and old-fashioned Quartiere Trieste—and nevertheless fell in with a group of anarchist friends before moving on. Rome has always been the backdrop for his adventures, for walks to the center, to Babylonia and Dakota, two long-lost avant-garde warehouses that blasted deafening techno and sold refurbished or painted Converse All Stars, Palladium sneakers, as well as Indian silk scarves, heavy-metal jewelry, fishnets, and industrial punk clothing. Outsiders from all parts of Rome flocked to these safe havens, gathering to shop, listen to music, and share ideas. Alessandro’s uncle had a studio restoring antique furniture tucked in the gardens of Via Margutta, and there Alessandro would smell the glue and mastic and dream of the past lives of tables and armchairs. He also spent hours in the Villa Giulia, the Renaissance palace that houses the National Etruscan Museum, immersing himself in its gardens, exploring pre-Roman antiquity and terra-cotta funerary monuments. While his peers were out late at raves, and gathering in the central piazzas for the infamous aperitivo tradition, Alessandro was looking up at roofs and domes, waiting for buildings to speak to him. “Rome,” he says, “bewitches you. It welcomes everyone in a disheveled way.” That fascination transferred to objects, art, books—and obviously clothes. So much of the way in which he revolutionized Gucci over his nearly eight-year run as creative director had to do with a guileless disposition toward untold stories, incursions into the past lives of ancient artifacts, monuments, and people. “I am a doctor for injured, dilapidated homes,” he tells me. “I buy places I think might need me, that have either been defaced or abandoned.” Alessandro and I are sitting in the renovated piano nobile apartment of the palazzo, he on a petroleum blue Tudor-era velvet armchair, lush dark braids framing his face. Some eight months after his exit from Gucci he has the calm, collected expression of someone who had seen it all and done it all and is happy to take a breather—though I am not sure working with a restoration team on an 800-year-old home counts as a break. Palazzo Scapucci is one of the few buildings in Rome with its very own medieval tower (where, in the 11th century, Saint Ottone Frangipane was supposedly born). In the 1400s, the surrounding structures functioned as a convent belonging to Pope Sixtus IV (during the restoration, Alessandro found original papal coats of arms from the late 1400s engraved in the high beams). More than a century later the entire property passed on to the wealthy Scapucci family who are linked to a legend told by Nathaniel Hawthorne in his , from 1871. As the legend goes, the Scapuccis had a beloved pet monkey who became unbearably jealous when their first child was born—so much so that she snatched the baby from the crib and escaped to the top of the tower, refusing to come back down. The father panicked and, as we tend to do in Italy during any moment of crisis, invoked the Virgin Mary, promising that if the baby were saved, he would keep an oil lamp perpetually lit in the tower in her honor. The miracle happened: The monkey returned the baby and the light at the top of the tower has been burning since. As Alessandro tells me this story, he moves his hands in the air, flashing his array of antique gold rings in space. To him such history is constantly with us. “I’m not convinced time passes as the calendar or the clock describes it,” he says. “The 800 years of these walls are to me. For this reason I am not nostalgic. I’m never really convinced that people who are no longer alive are gone. Everyone leaves strong traces behind.” Alessandro’s father was a subversive free spirit who frowned upon the idea of ownership. He was part of the occupation committee of Lotta Continua, the 1970s far-left political movement that fought to give housing to working families who couldn’t afford rent. “He had strong political beliefs, but also loved nature,” Alessandro says. “I’d say he was a pagan spirit, almost an animist. He would take us to the mountains and make us sit and listen. ‘You talk too much, be quiet,’ he’d say. ‘Listen to the wind passing over the leaves. That is God.’ ” When Alessandro’s family found they could no longer afford their house, they moved to squatted homes occupied by Lotta Continua in the northern end of Rome—a formative period for Alessandro. But the stray life came at a high cost, especially for his mother, who had a less radical vision of the world. “We shared our space with families we didn’t know,” remembers Alessandro. “That’s where I got my first big life training, where I learned the art of observation and developed a real interest in people.” He watched strangers coming and going at odd hours of the night, and when adults spoke, he sat in a corner and listened. “There were prostitutes, drug dealers, poor mothers who had been kicked out of their prior homes. Extraordinary human beings with extraordinary faces. So I know how important it is when someone takes you in.” It’s no coincidence he has chosen to live across the street from the Baroque church of Sant’Antonio dei Portoghesi, which emerged out of a hospice for Portuguese pilgrims, a place for charity and restoration. He also plans to offer residencies for artists in his country home (in the magical Etruscan area of northern Lazio) and when he was at Gucci, his desk was a stopping point for many globe-trotting creatives who wanted to share ideas. When Alessandro first came to see the apartment in the Palazzo Scapucci, it was a dark, illogical place, with low Styrofoam ceilings and no allure. “Every hall was filled with crammed rooms that opened onto more crammed rooms and small windows, but I kept coming back and observing from the sidewalk. When I fall in love, I don’t court houses, I stalk them.” He met the owners, three perfectly bizarre Roman characters: an uncle, a nephew, and an accountant who used the apartment as an office, and something of a hideaway for friends. “It already had this karma of belonging to multiple people,” he says. “It was a place for communal living.” Alessandro knew buying the house would be a huge undertaking, but ultimately decided to go for it. One of the many incredible things that happened in the work that followed was the discovery of the original roof beneath the suspended ceiling. It was filled with engravings, frescoes, those papal insignias, fleurs-de-lis of the kings of France, and a shield with the symbol of the Della Rovere family. Alessandro spent hours on the scaffolds. “I became friends with every centimeter of that ceiling,” he says, and laughs, “though I probably gave the restoration team a nervous breakdown too.” Lazy church bells ring in the distance. We have lost track of time talking about ghosts and discoveries, but now it is time for a tour. “Are you sure you’re ready?” Alessandro asked with a grin. His dogs, Bosco and Orso, wag their tails. In a second living room hang a pair of oak-branch-shaped chandeliers. “I never light my chandeliers,” he says. “I use them as furniture pieces. I like to see them in space.” The luminous kitchen, the heart of any Italian home, is flooded with midday Roman sunlight, irradiating Alessandro’s beautiful collection of Dutch Delft tiles and ancient wood-and-glass cabinets. A flight of marble steps brings us to a work studio and library, tucked in the iconic medieval monkey tower: “the most beautiful room in the house,” Alessandro says. Lately he’s been sneaking in here and pulling poetry books from the shelves. It’s a kind of meditation as he ponders his next steps and his own suspended moment. “It’s obvious I need oxygen now and it’s ironic that in reading all these poetry collections, I became so interested in the white space on the page and what it reveals about the words that inhabit it.” He gives me a mischievous grin. “Look at this,” he says and opens a hidden passageway in the bookcase, the kind of revolving library door kids dream about. The original building came equipped with many such vaults and portals, and Alessandro has taken advantage of them. Another vault, he explains, is hidden in his wardrobe (my favorite room as it features its own bathtub and a balustrade, and is filled with glass doors decorated with prints and textiles Alessandro designed himself). We cross through the dining room, where the table is piled with pens and books, including a thick anthology by the late poet and musicologist Amelia Rosselli. Then to the bedroom, with a beautiful Venetian door frame he’s reworked and adapted as a headboard. Next is Alessandro’s studio, accessible via a series of corridors, which is a work in progress, populated by boxes and perfectly organized archives of things like old Indian glass paintings and marionettes. Alessandro lifts a ladle out of nowhere. “It’s crazy, I started opening boxes the other day and found this ladle collection. I can’t believe how many of them I have.” We climb several stairs and past more rooms than Alessandro can show me. “It’s never-ending,” he says as we make our way out to the terrace, and the Sant’Antonio dei Portoghesi’s organ, the most ancient in Rome, fills the air. Through the leaves of the lush plants, rose bushes, and banana trees, we catch glimpses of passersby on the streets below. Alessandro is a nightwalker, a detail that I find incredibly romantic, but he also likes to get lost in the city during the day. It’s just a little more complicated because he lives in a crowded neighborhood and people recognize him constantly. So he puts on a baseball cap and sunglasses as we go for a coffee at the iconic bar Sant’Eustachio, serving what is widely known as the best espresso in the world, and talk about his love of film and theater. Alessandro watches only a few films a year, “but they are all extremely meaningful to me,” he says. We stroll—at a slow pace, zoning out in front of bookshops and old theaters. “Look at this,” he says, pointing to the Mannerist façade of the church of Sant’Andrea della Valle. “Rome is a city of safe little pockets right in the middle of chaos.” As we cross the Corso Vittorio, a Roman driver honks violently and yells at us: “Annamo un po!” (“Get a move on!”) Alessandro laughs. “My mother would always tell me that I live ‘a mezz’aria,’ ” he says. “Mid-air.” Inside the church the light filters through large tinted windows reflecting on a mirror in the center of the room, creating an all-pervasive golden hue. Alessandro comes here almost daily and still he’s completely transfixed. “The church in Rome is the greatest stage in the world,” he says. “I’m like a serial killer with this place. I always come back.” Another beloved place is the bustling Campo de’ Fiori, with its market stands and fruit sellers, who all seem to know Alessandro by name. We manage to resist the siren call of the square’s famous pizza bianca oven, cross through Piazza Farnese, and end up sitting down in a restaurant in the quaint Piazza della Quercia, with its brave, lonely oak tree at the center. Alessandro dreamily points to the old Roman mercantile area near the Tiber, and to Palazzo Spada, another place he likes to go to for inspiration. After lunch, still in dreamy mid-air mode, he leaves his wallet behind on the table and we are chased down the street by a kind tourist. “See how I am?” he laughs. And this prompts another reverie as we wind our way back to the Palazzo Scapucci: “Rome has been here thousands of years,” he says. “Soon we won’t be here, but she will. Rome seduces you, and warns you: ‘Being with me is tough. I may look beautiful, but I’m exhausting. I don’t work and I will make your life impossible.’ That gives me the right perspective.”",
//   "pubDate": "2023-11-28 12:00:00",
//   "image_url": "https://assets.vogue.com/photos/65550081cdcc84004742fa33/master/pass/1643-06.jpg",
//   "source_id": "vogue",
//   "source_priority": 4162,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "entertainment"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "0b937be0f3c83ef1fc00928fb0c4cfd4",
//   "title": "Prep baseball: St. Francis announces new head coach",
//   "link": "https://www.mercurynews.com/2023/11/27/prep-baseball-st-francis-hires-new-head-coach/",
//   "keywords": [
//   "High School Sports",
//   "Latest Headlines",
//   "Sports",
//   "High School Baseball",
//   "Inside Sports"
//   ],
//   "creator": [
//   "Joseph Dycus"
//   ],
//   "video_url": null,
//   "description": "Bay Area baseball: St. Francis announces San Jose City College alum as new baseball coach",
//   "content": "Wagle’s Live Oak team won the CCS Division III title in 2008. According to his LinkedIn profile, Wagle has also worked as an associate scout for the Washington Nationals.",
//   "pubDate": "2023-11-28 01:06:06",
//   "image_url": "https://www.mercurynews.com/wp-content/uploads/2023/04/BNG-L-SFMABB-0415-5-e1681602517485.jpg?w=1400px&strip=all",
//   "source_id": "mercurynews",
//   "source_priority": 2968,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "sports"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "a7487432b942e11a5f1c799cf4c680fe",
//   "title": "Prep baseball: St. Francis announces new head coach",
//   "link": "https://www.eastbaytimes.com/2023/11/27/prep-baseball-st-francis-hires-new-head-coach/",
//   "keywords": [
//   "High School Sports",
//   "Latest Headlines",
//   "Sports",
//   "High School Baseball",
//   "Inside Sports"
//   ],
//   "creator": [
//   "Joseph Dycus"
//   ],
//   "video_url": null,
//   "description": "Bay Area baseball: St. Francis announces San Jose City College alum as new baseball coach",
//   "content": "Wagle’s Live Oak team won the CCS Division III title in 2008. According to his LinkedIn profile, Wagle has also worked as an associate scout for the Washington Nationals.",
//   "pubDate": "2023-11-28 01:06:06",
//   "image_url": "https://www.eastbaytimes.com/wp-content/uploads/2023/11/BNG-L-SFMABB-0415-5-e1681602517485.jpg?w=1400px&strip=all",
//   "source_id": "eastbaytimes",
//   "source_priority": 17164,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "sports"
//   ],
//   "language": "english"
//   },
//   {
//   "article_id": "657589948523b899ea1128818a786ac3",
//   "title": "Loki creator Michael Waldron to hopefully get the next two Avengers movies back on track",
//   "link": "https://www.avclub.com/loki-michael-waldron-avengers-kang-dynasty-secret-wars-1851051743",
//   "keywords": null,
//   "creator": [
//   "Sam Barsanti"
//   ],
//   "video_url": null,
//   "description": "It looks like Marvel Studios’ plans for the end of the MCU’s “Phase Six” are solidifying behind the scenes… or they’re undergoing even more upheaval and are less solid than ever before. It’s really impossible to tell, and the only person who probably can is Marvel Studios boss Kevin Feige—and since he’s too busy…Read more...",
//   "content": "It looks like Marvel Studios’ plans for the end of the MCU’s “Phase Six” are solidifying behind the scenes… or they’re undergoing even more upheaval and are less solid than ever before. It’s really impossible to tell, and the only person who probably is Marvel Studios boss Kevin Feige—and since he’s too busy designing a baseball hat for the , he’s not going to be dishing the dirt any time soon. Either way, that Michael Waldron—creator of Disney+’s and showrunner on its first season—will be writing the , initially announced as and (though it’s unclear if any of the studio’s initial plans are still in place). Waldron was as the writer for only, but he’ll now be writing the preceding film as well, which definitely speaks to even if nobody knows exactly what. did just lose its director, with so he could focus on all of the other stuff Marvel is having him do, so it would make sense that the studio would take this as an opportunity to reconfigure some things—if that is what it’s doing. There is also , which seems relevant here for a number of reasons beyond it being yet another behind-the-scenes going on. If Majors (and his run as new MCU villain Kang) were less of a question mark, Waldron would make a lot of sense: He introduced arguably the most compelling version of that character so far in ’s first season, with the version seen in ’s second season being… less compelling, so he might have a good handle on what to do for Kang’s big villain movie. Orrrr maybe Feige trusts him to know how to handle some of the wacky multiverse nonsense that’s going to be happening in these next two movies and it has nothing to do with Kang. After all, Waldron did also write , which was almost entirely about that kind of nonsense. That movie was less successful with what it was trying to do than was, though, so it remains impossible to tell how any of us are supposed to feel about this. Perhaps the one concrete thing that Marvel fans can take away from this is that the studio is still doing rather than throwing up its hands and waiting for a different Kevin Feige from an alternate universe (this one has a gorgeous head of luxurious hair and never wears baseball hats) to step through an inter-dimensional portal and offer to fix everything. It happened to Spider-Man, so it’s not completely unheard of.",
//   "pubDate": "2023-11-27 23:38:00",
//   "image_url": null,
//   "source_id": "avclub",
//   "source_priority": 1771,
//   "country": [
//   "united states of america"
//   ],
//   "category": [
//   "entertainment"
//   ],
//   "language": "english"
//   }
//   ],
//   "nextPage": "1701128280391740480"
//   }