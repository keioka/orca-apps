
import { NextApiRequest, NextApiResponse } from 'next';
import * as FeatureFlag from '@/models/featureFlag';

export default async function featureFlagsHandler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const isProd = process.env.APP_ENV === 'production'
    const all = await FeatureFlag.fetchAllActive(isProd) || []
    const featureFlags = all.reduce((acc, flag) => {
      acc[flag.name] = true
      return acc
    }, {})

    return res.status(200).json({ featureFlags });
  } catch (error) {
    console.error(error)
    return res.status(500).json({ code: "FEATURE_FLAGS/ERROR", error: 'Failed to fetch feature flags.' });
  }
}
