import { useState, useCallback, useEffect } from 'react';
// import { CardArticle } from '../components/CardArticle';
// import { UserStats } from '../components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLessons } from '@/redux/features/lessons';
import { fetchCurrentUserStats } from '@/redux/features/auth';
import { Header } from '@/components/Header';
import { Material } from '@/components/Material';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { lessons } = useAppSelector((state) => state.lesson);
  const stats = useAppSelector((state) => state.auth.stats);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const fetchingCurrentUserStats = useAppSelector((state) => state.auth.fetchingCurrentUserStats);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchLessons())
      dispatch(fetchCurrentUserStats())
    }
  }, [currentUser]);

  console.log({ stats, lessons, fetchingCurrentUserStats })
  // const onPressStart = ({ url, lessonId }: { url: string, lessonId: string }) => {
  //   if (!lessonId) {
  //     console.error("Lesson ID is required")
  //     throw new Error("Lesson ID is required")
  //   }
  // }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchLessons())
    dispatch(fetchCurrentUserStats())
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return <div>
    <Header />
    {lessons && lessons.map((item, index) => (
      null
      // <Material
      //   key={`lesson_${item.id}`}
      //   item={item.material}
      //   // onPressStart={() => onPressStart({ url: item.material.url, lessonId: item.id })}
      //   lessonId={item.id}
      // />
    ))}
    Dashboard
  </div>;
}