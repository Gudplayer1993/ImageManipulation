import uploadIcon from './uploadIcon.png';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ClearIcon from '@mui/icons-material/Clear';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel } from './TabPanel';

const drawerWidth = 500;


const palettes = {
  none: [
  ],
  autumn: [
    { R: 0, G: 0, B: 0 },
    { R: 247, G: 136, B: 64 },
    { R: 234, G: 222, B: 222 },
    { R: 184, G: 82, B: 82 }
  ],
  winter: [
    { R: 15, G: 18, B: 37 },
    { R: 31, G: 65, B: 142 },
    { R: 173, G: 188, B: 205 },
    { R: 241, G: 236, B: 230 },
    { R: 234, G: 219, B: 212 }
  ],
  island: [
    { R: 54, G: 46, B: 35 },
    { R: 151, G: 142, B: 122 },
    { R: 202, G: 205, B: 199 },
    { R: 241, G: 215, B: 195 },
    { R: 125, G: 163, B: 190 }
  ]
}

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usePalette, setUsePallete] = useState(false);
  const [useEmboss, setUseEmboss] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
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
    setCurrentPalette('');
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

  const handleAddColor = () => {
    setImgOptions({ palette: [...imgOptions.palette, [{ R: 0, G: 0, B: 0 }]] });
  }

  const handlePaletteColorDelete = index => {
    const currentPalette = [...imgOptions.palette];
    currentPalette.splice(index, 1);
    setImgOptions({ palette: currentPalette });
  }

  const handleEmbossChange = () => {
    setUseEmboss(prev => {
      setImgOptions({ emboss: !prev })
      return !prev
    });
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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
          <Tabs value={currentTab} onChange={handleTabChange} className="tabContainer">
            <Tab label="Image" />
            <Tab label="Background" />
          </Tabs>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <div className="drawerOptionContainer">

          <TabPanel value={currentTab} index={0}>
            <div>
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
              <Divider />
              <div className="drawerOption">
                <FormGroup>
                  <FormControlLabel
                    control={<Switch checked={useEmboss} onChange={handleEmbossChange} />}
                    label="Emboss"
                  />
                </FormGroup>
              </div>
              <Divider />
              <div className="drawerOption">
                <FormGroup>
                  <FormControlLabel
                    control={<Switch checked={usePalette} onChange={handleUsePaletteChange} />}
                    label="Show Pallete"
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
                        } else {
                          return currentPalette
                        }
                      }}
                      MenuProps={MenuProps}
                      inputProps={{ 'aria-label': 'Without label' }}
                    >
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
                  <List className="paletteColorWrapper">
                    {
                      imgOptions.palette.map((color, index) => {
                        return (<ListItem >
                          <ListItemButton className="paletteOption">
                            <ListItemText primary={rgbToHex(color.R, color.G, color.B)} />
                            <input type="color" key={index} value={rgbToHex(color.R, color.G, color.B)} onChange={event => handleChangePaletteColor(event, index)} />
                            <ClearIcon sx={{ padding: '5px' }} onClick={() => handlePaletteColorDelete(index)} />
                          </ListItemButton>
                        </ListItem>)
                      })
                    }
                    <Button variant="outlined" sx={{ marginTop: '10px' }} onClick={handleAddColor}>Add Color</Button>
                  </List>
                </Collapse>
              </div>
              <Divider />
            </div>
            <div className="drawerOption footer">
              <Button sx={{ width: "100%" }} variant="contained" className="drawerItem" onClick={() => { setSelectedImage(null); setOpen(false); setImgSrc(null); }}>DELETE IMAGE</Button>
            </div>
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            BACKGROUND
          </TabPanel>
        </div>
        <Divider />
      </Drawer>
      <Main className="App-header" open={open}>
        <Grow in={!selectedImage} className={!selectedImage ? 'render App-logo' : 'noRender'}>
          <img src={uploadIcon} onClick={onBtnClick} />
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
