import {
  Button,
} from "@mui/material";
import GoogleLogo from "react:~assets/images/google.svg"

export function ButtonGoogleAuth({ onClick, isSignup }: { onClick: () => void, isSignup?: boolean }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
    // sx={{ color: "#fff" }}
    >
      <GoogleLogo width={18} height={18} style={{ marginRight: 4 }} />
      {isSignup ? chrome.i18n.getMessage("signup_google") : chrome.i18n.getMessage("login_google")}
    </Button>
  )
}