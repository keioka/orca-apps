import {
  Button,
} from "@mui/material";
import GoogleLogo from "react:~assets/images/google.svg"

export function ButtonGoogleLogin({ onLogin }) {
  return (
    <Button
      variant="outlined"
      onClick={onLogin}
    // sx={{ color: "#fff" }}
    >
      <GoogleLogo width={18} height={18} style={{ marginRight: 4 }} />
      {chrome.i18n.getMessage("button_login")}
    </Button>
  )
}