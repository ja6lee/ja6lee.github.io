import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppBar, Toolbar, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import './App.css';
import {
    CrosswordGrid,
    CrosswordProvider,
    DirectionClues,
} from '@jaredreisinger/react-crossword';

function App() {
  const crosswordProvider = useRef(null);
  const [currentCrosswordName, setCurrentCrosswordName] = useState(null);
  const [currentCrossword, setCurrentCrossword] = useState(null);
  const [currentClue, setCurrentClue] = useState("");
  const [crosswords, setCrosswords] = useState(null);
  const onClueSelected = useCallback((direction, number) => {
      const clue = currentCrossword[direction][number]
      if (!clue) {
          setCurrentClue("");
      } else {
          setCurrentClue(`${number}. ${clue.clue}`)
      }
  }, [currentCrossword, setCurrentClue]);
  
  useEffect(() => {
      const crosswords = [
          { value: './puzzles/cpu.json', label: 'CS', json: require('./puzzles/cpu.json') },
          { value: './puzzles/easy.json', label: 'Easy', json: require('./puzzles/easy.json')  }
      ];
      setCurrentCrosswordName(crosswords[0].value);
      setCurrentCrossword(crosswords[0].json);
      setCrosswords(crosswords);
  }, []);

  const onCrosswordCompleted = useCallback(() => {
      // TODO: this
      console.log("Puzzle completed");
      alert("You win!");
  }, []);

  const onCellChanged = useCallback((row, col, guess) => {
      const changedElement = document.getElementById(`g-R${row}C${col}`);
      changedElement.children[1].style.fill = '#000000';
  }, []);

  const onCrosswordChanged = useCallback((event) => {
      setCurrentClue("");
      setCurrentCrossword(crosswords.find((c) => c.value === event.target.value).json)
      setCurrentCrosswordName(event.target.value);
  }, [crosswords]);

  const onReset = useCallback(() => {
      if (window.confirm('Are you sure you want to delete any saved progress on this puzzle?')) {
          crosswordProvider.current.reset();
      }
  }, [crosswordProvider]);

  const onCheckPuzzle = useCallback(() => {
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
  
  if (!crosswords) {
      return null;
  }

  return (
      <div className="App">
          <header>
              <AppBar className="app-header">
                  <Toolbar className="toolbar">
                      Heffe's Crosswords
                      <div className="right-nav-bar">
                          <Button
                              onClick={onReset}
                              variant="contained"
                              color="warning"
                          >
                              Reset
                          </Button>
                          <Button
                              onClick={onCheckPuzzle}
                              variant="contained"
                              color="success"
                          >
                              Check
                          </Button>
                          <FormControl>
                              <InputLabel id="crossword-select-label" style={{color: '#ffffff'}}>Select a crossword</InputLabel>
                              <Select
                                  sx={{
                                      width: 200,
                                      color: 'white',
                                      borderColor: 'white',
                                      '.MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                      },
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: 'white',
                                      },
                                      "& .MuiSvgIcon-root": {
                                          color: "white",
                                      },
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
                                      return <MenuItem value={crossword.value}>{crossword.label}</MenuItem>;
                                  })}
                              </Select>
                          </FormControl>
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
                          onClueSelected={onClueSelected}
                          onCellChange={onCellChanged}
                          onCrosswordCorrect={onCrosswordCompleted}>
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

      </div>
  );
}

export default App;
