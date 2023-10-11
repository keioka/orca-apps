import type { Story } from "@ladle/react";
import { FormSubscriptionPure } from "./FormSubscription";


export const Simple: Story = () => (
  <FormSubscriptionPure user={{ email: "hello", uid: "hello" }} onLogin={() => { }} />
);