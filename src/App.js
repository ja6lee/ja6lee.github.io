import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppBar, Toolbar, Select, MenuItem, InputLabel, FormControl, IconButton, Popper, Grow, Paper,
         ClickAwayListener, MenuList } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import './App.css';
import {
    CrosswordGrid,
    CrosswordProvider,
    DirectionClues,
} from '@jaredreisinger/react-crossword';

const STATUS = {
    STARTED: 'Started',
    STOPPED: 'Stopped',
};

function getSecondsFromLocalStorage(key) {
    const { localStorage } = window;
    if (!localStorage) {
        return;
    }
    return parseInt(localStorage.getItem(`timer-${key}`) || 0);
}

function App() {
  const crosswordProvider = useRef(null);
  const menuRef = useRef(null);
  const [currentCrosswordName, setCurrentCrosswordName] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentCrossword, setCurrentCrossword] = useState(null);
  const [currentClue, setCurrentClue] = useState("");
  const [crosswords, setCrosswords] = useState(null);
  const [seconds, setSeconds] = useState(0); // TODO: get this from local storage
  const [status, setStatus] = useState(STATUS.STARTED);

  const onClueSelected = useCallback((direction, number) => {
      const clue = currentCrossword[direction][number]
      if (!clue) {
          setCurrentClue("");
      } else {
          setCurrentClue(`${number}. ${clue.clue}`)
      }
  }, [currentCrossword, setCurrentClue]);

  useEffect(() => {
      const { localStorage } = window;
      if (!localStorage || !currentCrosswordName) {
          return;
      }
      localStorage.setItem(`timer-${currentCrosswordName}`, '' + seconds);
  }, [seconds, currentCrosswordName]);

  useEffect(() => {
      const crosswords = [
          { value: './puzzles/roll.json', label: 'July 29, 2022', json: require('./puzzles/roll.json')  },
          { value: './puzzles/cpu.json', label: 'July 26, 2022', json: require('./puzzles/cpu.json') },
          { value: './puzzles/easy.json', label: 'Test puzzle', json: require('./puzzles/easy.json')  }
      ];
      setCurrentCrosswordName(crosswords[0].value);
      setCurrentCrossword(crosswords[0].json);
      setCrosswords(crosswords);
      setSeconds(getSecondsFromLocalStorage(crosswords[0].value));
  }, []);

  const onSolvePuzzle = useCallback(() => {
      setOpen(false);
      if (crosswordProvider && crosswordProvider.current) {
          crosswordProvider.current.fillAllAnswers();
      }

  }, [crosswordProvider]);

  const onCrosswordCompleted = useCallback((isCorrect) => {
      // TODO: this
      if (isCorrect) {
          console.log("Puzzle completed");
          alert("You win!");
          setStatus(STATUS.STOPPED);
      }

  }, []);

  const onCellChanged = useCallback((row, col, guess) => {
      const changedElement = document.getElementById(`g-R${row}C${col}`);
      changedElement.children[1].style.fill = '#000000';
  }, []);

  const onCrosswordChanged = useCallback((event) => {
      setCurrentClue("");
      setCurrentCrossword(crosswords.find((c) => c.value === event.target.value).json);
      setCurrentCrosswordName(event.target.value);
      setSeconds(getSecondsFromLocalStorage(event.target.value));
      setStatus(STATUS.STARTED);
      setOpen(false);
  }, [crosswords]);

  const onReset = useCallback(() => {
      setOpen(false);
      if (window.confirm('Are you sure you want to delete any saved progress on this puzzle?')) {
          crosswordProvider.current.reset();
          setSeconds(0);
          setStatus(STATUS.STARTED);
      }
  }, [crosswordProvider]);

  const onCloseMenu = useCallback((event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) {
          return;
      }
      console.log(event.target);

      setOpen(false);
  }, []);

  const onToggleMenu = useCallback(() => {
      setOpen(!open);
  }, [open])

  const onCheckPuzzle = useCallback(() => {
    setOpen(false);
    const correctElements = document.getElementsByClassName('guess-text-correct');
    const incorrectElements = document.getElementsByClassName('guess-text-incorrect');
    for (let i = 0; i < correctElements.length; i++) {
        correctElements[i].style.fill = '#64c864';
    }
    for (let i = 0; i < incorrectElements.length; i++) {
        if (incorrectElements[i].textContent) {
            incorrectElements[i].style.fill = '#FF5733';
        }
    }
  }, []);

  useInterval(() => {
      setSeconds(seconds + 1);
  }, status === STATUS.STARTED ? 1000 : null)
  
  if (!crosswords) {
      return null;
  }

  const secondsToDisplay = seconds % 60
  const minutes = (seconds - secondsToDisplay) / 60
  const minutesToDisplay = minutes % 60
  const hoursToDisplay = (minutes - minutesToDisplay) / 60

  return (
      <div className="App">
          <header>
              <AppBar className="app-header" position="sticky">
                  <Toolbar className="toolbar">
                      Heffe's Crosswords
                      <div className="right-nav-bar">
                          <div className="timer">
                              {hoursToDisplay > 0 && `${twoDigits(hoursToDisplay)}:`}{twoDigits(minutesToDisplay)}:
                              {twoDigits(secondsToDisplay)}
                          </div>
                          <IconButton
                              ref={menuRef}
                              size="large"
                              edge="start"
                              color="inherit"
                              aria-label="menu"
                              sx={{ mr: 2 }}
                              onClick={onToggleMenu}
                          >
                              <MenuIcon />
                          </IconButton>
                          <Popper
                              open={open}
                              anchorEl={menuRef.current}
                              role={undefined}
                              placement="bottom-start"
                              transition
                              disablePortal
                          >
                              {({ TransitionProps, placement }) => (
                                  <Grow
                                      {...TransitionProps}
                                      style={{
                                          transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                                      }}
                                  >
                                      <Paper>
                                          <ClickAwayListener onClickAway={onCloseMenu} mouseEvent="onMouseUp">
                                              <MenuList
                                                  autoFocusItem={open}
                                                  id="composition-menu"
                                              >
                                                  <MenuItem onClick={onSolvePuzzle}>Solve</MenuItem>
                                                  <MenuItem onClick={onReset}>Reset</MenuItem>
                                                  <MenuItem onClick={onCheckPuzzle}>Check</MenuItem>
                                                  <MenuItem>
                                                      <FormControl>
                                                          <InputLabel id="crossword-select-label">Select a crossword</InputLabel>
                                                          <Select
                                                              sx={{
                                                                  width: 200,
                                                              }}
                                                              id="crossword-selector"
                                                              labelId="crossword-select-label"
                                                              label="Select a crossword"
                                                              value={currentCrosswordName}
                                                              onChange={onCrosswordChanged}
                                                              options={crosswords}
                                                              MenuProps={{
                                                                  PaperProps: {
                                                                      sx: {
                                                                          bgcolor: 'white'
                                                                      },
                                                                  },
                                                              }}
                                                          >
                                                              {crosswords.map((crossword) => {
                                                                  return <MenuItem className="puzzle-menu-item" key={crossword.value} value={crossword.value}>{crossword.label}</MenuItem>;
                                                              })}
                                                          </Select>
                                                    </FormControl>
                                                  </MenuItem>
                                              </MenuList>
                                          </ClickAwayListener>
                                      </Paper>
                                  </Grow>
                              )}
                          </Popper>

                      </div>
                  </Toolbar>
              </AppBar>
          </header>
          <div className="crossword-container">
                  <div className="crossword-wrapper">
                      <CrosswordProvider
                          useStorage={true}
                          storageKey={currentCrosswordName}
                          ref={crosswordProvider}
                          data={currentCrossword}
                          circles={currentCrossword['circles']}
                          onClueSelected={onClueSelected}
                          onCellChange={onCellChanged}
                          onCrosswordComplete={onCrosswordCompleted}>
                          <div className="grid-container">
                              <CrosswordGrid />
                              <div className="current-clue">
                                  {currentClue}
                              </div>
                          </div>
                          <DirectionClues direction="across" />
                          <DirectionClues direction="down" />
                      </CrosswordProvider>
                  </div>
          </div>
          {currentClue &&
              <footer id='mobile-footer' className="mobile-footer" role="contentinfo">
                  <div className="mobile-clue">
                      {currentClue}
                  </div>
              </footer>
          }
      </div>
  );
}

function useInterval(callback, delay) {
    const savedCallback = useRef()

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current()
        }
        if (delay !== null) {
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}
const twoDigits = (num) => String(num).padStart(2, '0');

export default App;
