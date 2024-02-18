import {
  Button,
} from "@mui/material";
import GoogleLogo from "react:~assets/images/google.svg"

export function ButtonGoogleAuth({ size, onClick, isSignup }: { size: string, onClick: () => void, isSignup?: boolean }) {
  return (
    <Button
      size={size}
      variant="outlined"
      onClick={onClick}
      sx={{
        background: "#fff",
        color: "#000",
      }}
    >
      <GoogleLogo width={18} height={18} style={{ marginRight: 4 }} />
      {isSignup ? chrome.i18n.getMessage("signup_google") : chrome.i18n.getMessage("login_google")}
    </Button>
  )
}