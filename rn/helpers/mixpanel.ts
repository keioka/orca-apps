import ExpoMixpanelAnalytics from '@bothrs/expo-mixpanel-analytics';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  phone: string;
  address: string;
  birthday: string;
}

export interface IncrementDetails {
  [key: string]: number;
}

export interface UnionDetails {
  [key: string]: string[];
}


export enum ACTION {
  signup = 'Signup',
  login = 'Login',
  startNewLesson = "Start Lesson",
  reVisitLesson = "Revisit Lesson",
  endLesson = "End Lesson",
  startChat = "Start Chat",
  endChat = "End Chat",
  record = "Record",
  addMessage = "Add Message",
}

class AnalyticsModule {
  private analytics: ExpoMixpanelAnalytics;

  constructor() {
    if (this.isProd()) {
      try {
        this.analytics = new ExpoMixpanelAnalytics(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN);
      } catch (err) {
        console.error({ err })
        throw new Error(err)
      }
    }
  }

  private isProd(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  identify(userId: string): void {
    if (this.isProd()) {
      this.analytics.identify(userId);
    } else {
      console.log(`MixPanel: Identify user ${userId}`);
    }
  }

  trackSignUp(referredBy: string): void {
    if (this.isProd()) {
      this.analytics.track("Signed Up", { "Referred By": referredBy });
    } else {
      console.log(`MixPanel: Track sign up`);
    }
  }

  track(action: ACTION, properties?: any): void {
    if (this.isProd()) {
      this.analytics.track(action, properties);
    } else {
      console.log(`MixPanel: Track ${action}, ${JSON.stringify(properties)}`);
    }
  }

  setProfileDetails(userProfile: UserProfile): void {
    if (this.isProd()) {
      this.analytics.people_set(userProfile);
    } else {
      console.log(`MixPanel: Set profile details`);
    }
  }

  setOnce(firstLoginDate: string): void {
    if (this.isProd()) {
      this.analytics.people_set_once({ "First login date": firstLoginDate });
    } else {
      console.log(`MixPanel: Set once`);
    }
  }

  unsetDetails(fields: string[]): void {
    if (this.isProd()) {
      this.analytics.people_unset(fields);
    }
  }

  incrementDetails(details: IncrementDetails): void {
    if (this.isProd()) {
      this.analytics.people_increment(details);
    }
  }

  appendDetails(detail: { [key: string]: string }): void {
    if (this.isProd()) {
      this.analytics.people_append(detail);
    }
  }

  unionDetails(details: UnionDetails): void {
    if (this.isProd()) {
      this.analytics.people_union(details);
    }
  }

  deleteUser(): void {
    if (this.isProd()) {
      this.analytics.people_delete_user();
    }
  }

  resetAnalytics(): void {
    if (this.isProd()) {
      this.analytics.reset();
    }
  }
}

export const analytics = new AnalyticsModule();

