import uploadIcon from './uploadIcon.png';
import './App.css';
import React, { useState, useEffect, useMemo } from "react";
import Grow from '@mui/material/Grow';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { styled, createTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import { process } from './jimp';
import CircularProgress, {
  circularProgressClasses,
} from '@mui/material/CircularProgress';
import FormGroup from '@mui/material/FormGroup';
import Slider from '@mui/material/Slider';
import debounce from 'lodash.debounce';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import Switch from '@mui/material/Switch';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { rgbToHex, replace, hexToRGB } from './utils';


const drawerWidth = 500;


const palettes = {
  // RGB: [{ R: 255, G: 0, B: 0 },
  // { R: 0, G: 255, B: 0 },
  // { R: 0, G: 0, B: 255 }],
  autumn: [
    { R: 0, G: 0, B: 0 },
    { R: 247, G: 136, B: 64 },
    { R: 234, G: 222, B: 222 },
    { R: 184, G: 82, B: 82 }
  ]
}

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usePalette, setUsePallete] = useState(false);
  const [currentPalette, setCurrentPalette] = useState('');
  const [imgOptions, _setImgOptions] = useState({ pixelate: 1, palette: [] });

  useEffect(() => {
    if (selectedImage) {
      setLoading(true);
      const _imgOptions = imgOptions;
      if (!usePalette) {
        _imgOptions.palette = [];
      }
      processImage(_imgOptions).then(res => {
        setImgSrc(res);
        setLoading(false);
      });
    }
  }, [selectedImage, imgOptions, usePalette])

  const theme = createTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#3f50b5',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });

  const onBtnClick = () => {
    inputFileRef.current.click();
  };

  const renderImage = useMemo(() =>
    <div className="imageWrapper">
      {loading && < CircularProgress
        size={100}
        sx={{
          color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
          animationDuration: '550ms',
          position: 'absolute',
          margin: 'auto',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
      />
      }
      <div>
        <img src={imgSrc} />
      </div>
    </div>
    , [imgSrc, loading])

  const processImage = options => {
    if (!selectedImage) { return }
    return process(selectedImage.arrayBuffer(), options)
  }

  const inputFileRef = React.useRef();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    }),
  );

  const setImgOptions = newOptions =>
    _setImgOptions({ ...imgOptions, ...newOptions });

  const handlePixelationChange = (event, newValue) => {
    setImgOptions({ pixelate: newValue });
  }
  const debouncedHandlePixelationChange = debounce(handlePixelationChange, 500)

  const handleUsePaletteChange = () => {
    setCurrentPalette([]);
    setUsePallete(prev => !prev);
  }

  const handlePaletteChangeOption = event => {
    const {
      target: { value },
    } = event;
    setCurrentPalette(value)
    setImgOptions({ palette: [...palettes[value]] });
  }

  const handleChangePaletteColor = (event, index) => {
    const rgbArr = hexToRGB(event.target.value);
    const transformedSelectedColor = { R: rgbArr[0], G: rgbArr[1], B: rgbArr[2] }
    let currentPaletteOptions = replace([...imgOptions.palette], index, transformedSelectedColor);
    setImgOptions({ palette: [...currentPaletteOptions] });
  }

  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
    background: '#282c34',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  const DrawerHeader = styled('div')(({ theme }) => ({

    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }));

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Box sx={{ display: 'flex' }} className="App">
      <AppBar position="fixed" open={open}>
        {selectedImage &&
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        }
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            color: 'white',
            backgroundColor: '#191c21',
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Button variant="contained" className="drawerItem" onClick={() => { setSelectedImage(null); setOpen(false); setImgSrc(null); }}>Remove</Button>
        <div className="drawerOptionContainer">
          <div className="drawerOption">
            <Typography gutterBottom>Pixelation</Typography>
            <Slider
              aria-label="Temperature"
              defaultValue={1}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={20}
              onChange={debouncedHandlePixelationChange}
            />
          </div>

          <div className="drawerOption">
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={usePalette} onChange={handleUsePaletteChange} />}
                label="Show"
              />
            </FormGroup>
            <Collapse in={usePalette}>
              <FormControl sx={{ m: 1, width: 300, mt: 3 }}>
                <Select
                  displayEmpty
                  value={currentPalette}
                  onChange={handlePaletteChangeOption}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Palette</em>;
                    }
                  }}
                  MenuProps={MenuProps}
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem disabled value="">
                    <em>Placeholder</em>
                  </MenuItem>
                  {Object.keys(palettes).map(paletteName => (
                    <MenuItem
                      key={paletteName}
                      value={paletteName}
                    >
                      {paletteName}
                    </MenuItem>
                  ))}
                </Select>

              </FormControl>
            </Collapse>
            <Collapse in={imgOptions.palette}>
              {
                imgOptions.palette.map((color, index) => {
                  return (<div className="paletteOption">
                    <Typography>{rgbToHex(color.R, color.G, color.B)}</Typography>
                    <input type="color" value={rgbToHex(color.R, color.G, color.B)} onChange={event => handleChangePaletteColor(event, index)} />
                  </div>)
                })
              }
            </Collapse>
          </div>
        </div>
        <Divider />
      </Drawer>
      <Main className="App-header" open={open}>
        <Grow in={!selectedImage} className={!selectedImage ? 'render' : 'noRender'}>
          <img src={uploadIcon} className="App-logo" alt="logo" onClick={onBtnClick} />
        </Grow>
        {renderImage}
        <input
          hidden
          ref={inputFileRef}
          type="file"
          name="myImage"
          onChange={(event) => {
            setSelectedImage(event.target.files[0]);
            setOpen(true);
          }}
        />
      </Main>
    </Box >

  );
}

export default App;
