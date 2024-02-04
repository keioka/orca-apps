import { useState, useCallback, useEffect, useMemo } from 'react';
// import { CardArticle } from '../components/CardArticle';
// import { UserStats } from '../components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Header } from '@/components/Header';
import { saveVocab, fetchSavedVocab, fetchSavedParaphrases } from '@/redux/features/note';
import { Box, Stack, Typography, Button, Card } from '@mui/material'
import { fetchPayments } from '@/redux/features/payment';
import { FaCircleCheck } from "react-icons/fa6";
import moment from 'moment';
import { ContentPremiumPlan } from '@/components/ContentPremiumPlan';

enum Tab {
  Vocab = 0,
  Paraphrase = 1
}

const convertStatusToText = {
  'no_subscription': '無料プラン',
  'trialing': '無料トライアル中',
}

export default function Plan() {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { lessons } = useAppSelector((state) => state.lesson);
  const stats = useAppSelector((state) => state.auth.stats);
  const [tab, setTab] = useState(Tab.Vocab);

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const subscriptions = useAppSelector((state) => state.payment.subscriptions)
  const status = useAppSelector((state) => state.payment.status)
  const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : {}
  const trialInfo = subscription.trialInfo

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchPayments())
    }
  }, [currentUser])

  const handleUpgrade = () => {
    const url = `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}?prefilled_email=${currentUser.email}&client_reference_id=${currentUser.uid}`
    window.open(url, '_blank')
  }

  const handleManagePayment = () => {
    const url = `${process.env.NEXT_PUBLIC_STRIPE_BILLING_LINK}`
    window.open(url, '_blank')
  }

  if (!currentUser) {
    return (
      <Box>
        <Header />
      </Box>
    )
  }

  return (
    <Box p={2}>
      <Header />
      <Stack sx={{ mt: 2, alignItems: "center", background: "#f4f4f4", borderRadius: 1 }} p={2}>
        <Typography variant="body2">現在のプラン</Typography>
        <Typography variant="h6">{convertStatusToText[status]}</Typography>
        {trialInfo && <Typography variant="body2">トライアル期間：{moment(trialInfo.start).format('MMMM Do YYYY, h:mm:ss a')} - {moment(trialInfo.end).format('MMMM Do YYYY, h:mm:ss a')}</Typography>}
        {
          status !== 'no_subscription' && (
            <Stack sx={{ mt: 2, alignItems: "center", background: "#f4f4f4", borderRadius: 1 }} p={2} spacing={2}>
              <Button onClick={handleManagePayment} variant="contained" sx={{ color: "#fff" }}>解約やカードの変更はこちら</Button>
            </Stack>
          )
        }
      </Stack>
      {status === 'no_subscription' &&
        <ContentPremiumPlan
          handleUpgrade={handleUpgrade}
        />
      }

    </Box>
  );
}