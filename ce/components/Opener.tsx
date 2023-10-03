import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import { IoCloseCircle } from "react-icons/io5"
import Logo from "react:~assets/images/logo.svg"

const OpenerSize = 48

export function Opener({ setOpen, setHideExtention }: { setHideExtention: (hide: boolean) => void, setOpen }) {
  const [isHover, setIsHover] = useState(false)
  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        right: "0px",
        top: "140px",
        zIndex: 2,
        pointerEvents: "auto",
        borderRadius: "50% 0px 0px 50%",
        backgroundColor: theme.palette.primary.main, // Use the primary color
      })}
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
    >
      {/* {isHover && ( */}
      <Button
        onClick={() => setHideExtention(true)}
        sx={(theme) => ({
          backgroundColor: theme.palette.primary.main, // Use primary color from theme
          color: "#fff",
          width: `${OpenerSize}px`,
          height: `${OpenerSize}px`,
          minWidth: "0px",
          padding: 0,
          borderRadius: "50% 0px 0px 50%",
          "&:hover": {
            backgroundColor: theme.palette.primary.dark, // Example: using a darker variant on hover
          }
        })}
      >
        <IoCloseCircle size={24} color="#fff" />
      </Button>
      {/* )} */}
      <Button
        onClick={() => setOpen(true)}
        sx={(theme) => ({
          fontFamily: "Open Sans",
          backgroundColor: theme.palette.primary.main, // Use primary color from theme
          color: "#fff",
          width: `${OpenerSize}px`,
          height: `${OpenerSize}px`,
          borderRadius: "0px 0px 0px 0px",
          "&:hover": {
            backgroundColor: theme.palette.primary.main, // Use primary color from theme for hover as well
          }
        })}
      >
        {/* <Box sx={{ transform: "scale(0.07)" }}>
          <Logo />
        </Box> */}
        <Typography sx={{ fontSize: 8, fontWeight: 700 }}>{chrome.i18n.getMessage("opener_label")}</Typography>
      </Button>
    </Box>
  )

}