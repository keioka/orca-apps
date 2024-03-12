import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { ButtonGoogleLogin } from "~/components/ButtonGoogleLogin";
import { MdWorkspacePremium } from "react-icons/md"
import { AiFillCheckCircle } from "react-icons/ai"
import { useAppDispatch } from "~redux/hooks";
import { clearSubscriptionForm } from "~redux/features/ui";
import { sendToBackground } from "@plasmohq/messaging"

export function FormSubscriptionPure({ user, onLogin, onClose, onOpenPopup }) {
  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        background: theme.palette.customPalette.yellow,
        borderRadius: 1,
        display: "flex",
        // border: `16px solid ${theme.palette.primary.main}`,
      })}
      p={2}
    >
      <Box
        sx={(theme) => ({
          width: "100%",
          background: "#fff",
          borderRadius: 1,
        })}
        p={2}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: "18px", fontWeight: 600, textAlign: "center", fontFamily: "NotoSansJP" }}>
              {chrome.i18n.getMessage("subscription_form_title")}
            </Typography>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, textAlign: "center", fontFamily: "NotoSansJP" }}>
              {chrome.i18n.getMessage("subscription_form_subtitle")}
            </Typography>
          </Stack>

          <Box sx={(theme) => ({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            padding: 1,
          })}>
            <Stack spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontFamily: "NotoSansJP", fontWeight: 600, fontSize: 24 }}>
                {chrome.i18n.getMessage("subscription_form_price")}
              </Typography>
              <Typography sx={{ fontFamily: "NotoSansJP", fontSize: 14 }}>
                {chrome.i18n.getMessage("subscription_form_price_rate")}
              </Typography>
            </Stack>
          </Box>
          <Stack spacing={1}>
            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <AiFillCheckCircle size={18} color="#19b837" />
              <Typography sx={{ fontSize: 14, fontFamily: "NotoSansJP" }}>
                {chrome.i18n.getMessage("subscription_feature_unlimited_chat")}
              </Typography>
            </Stack>

            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <AiFillCheckCircle size={18} color="#19b837" />
              <Typography sx={{ fontSize: 14, fontFamily: "NotoSansJP" }}>
                {chrome.i18n.getMessage("subscription_feature_vocab")}
              </Typography>
            </Stack>

            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <AiFillCheckCircle size={18} color="#19b837" />
              <Typography sx={{ fontSize: 14, fontFamily: "NotoSansJP" }}>
                {chrome.i18n.getMessage("subscription_feature_paraphrase")}
              </Typography>
            </Stack>

            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
              <AiFillCheckCircle size={18} color="#19b837" />
              <Typography sx={{ fontSize: 14, fontFamily: "NotoSansJP" }}>
                {chrome.i18n.getMessage("subscription_feature_gmCheck")}
              </Typography>
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Button
              variant="contained"
              sx={{ color: "#fff", fontFamily: "NotoSansJP" }}
              onClick={onOpenPopup}
            >
              <MdWorkspacePremium size={18} style={{ marginRight: 4 }} />
              {chrome.i18n.getMessage("button_payment_link")}
            </Button>
            <Button
              variant="outlined"
              sx={(theme) => ({ color: theme.palette.primary.main, fontFamily: "NotoSansJP" })}
              onClick={onClose}
            >
              {chrome.i18n.getMessage("close")}
            </Button>
          </Stack>
        </Stack>
        {/* {!user && (
          <Box
            sx={{
              padding: "16px",
              width: "100%",
              height: "100%",
            }}
          >
            <Typography variant="h6" component="h6">
              {chrome.i18n.getMessage("subscription_title")}
            </Typography>
            <ButtonGoogleLogin onLogin={onLogin} />
          </Box>
        )
        }
        {
          user && (
            <a href={`${process.env.PLASMO_PUBLIC_STRIPE_PAYMENT_LINK}?prefilled_email=${user.email}&client_reference_id=${user.uid}`} target="_blank" style={{ width: "100%" }}>
              <Button
                color="primary"
                variant="contained"
                sx={{
                  color: "#fff",
                  width: "100%"
                }}
              >
                <MdWorkspacePremium size={18} style={{ marginRight: 4 }} />
                {chrome.i18n.getMessage("button_payment_link")}
              </Button>
            </a>
          )
        } */}
      </Box>
    </Box >
  )
}

export function FormSubscription({ user, onLogin }) {
  const dispatch = useAppDispatch()

  function handleClose() {
    dispatch(clearSubscriptionForm())
  }

  async function handleOpenPopup() {
    try {
      await sendToBackground({
        name: "openPopup",
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <FormSubscriptionPure user={user} onLogin={onLogin} onClose={handleClose} onOpenPopup={handleOpenPopup} />
  )
}