import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
const Header = () => {
  return (
    <AppBar position="static" sx={{ height: 60 }}>
      <Typography variant="h4">ヤニレコ</Typography>
    </AppBar>
  );
};

export default Header;
