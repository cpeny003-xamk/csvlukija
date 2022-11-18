import React, { useContext, useEffect, useRef, useState } from 'react';
import Papa from 'papaparse'
import { useFilePicker } from 'use-file-picker';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Container, Typography, CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, InputLabel, Input, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Context } from './context/context';
import { Taulukko } from './components/Taulukko';
import { Searchresults } from './components/Searchresults';

interface Data {
  data : any[]
  errors : any[]
  meta : any
}

function App() {
  const { paketti, setPaketti, setSearchResults, searchResults, duplicates, setDuplicates } = useContext(Context)
  const hakuehtoRef : any = useRef<any>();
  const [hakuehto, setHakuEhto] = useState<string>();
  const [openFileSelector, { plainFiles, loading }] = useFilePicker({
    accept: '.csv',
  })
  ;

  useEffect(() => {
    if (plainFiles.length > 0)
    {
      Papa.parse(plainFiles[0], {complete: (results : Papa.ParseResult<Data | undefined>) => {setPaketti([...paketti, {data : results, tiedostonimi : plainFiles[0].name}])}})
    }
  }, [plainFiles])

  
  const testausFunktio = async () => {
    await openFileSelector();
  }

  if (loading) {
    return <CircularProgress/>;
  }

  return (
    <Container sx={{width:"960px"}}>
      <button onClick={() => testausFunktio()}>Select files </button>

      {/* Hakeminen hakuehdolla */}
      <button onClick={() => setSearchResults(paketti.map((tieto : any, idx : number) => {
        return ([tieto.tiedostonimi, tieto.data.data.filter((nimi : any) => {
          let hakusana = new RegExp(`${hakuehtoRef!.current!.value}`, "i")
          return (hakusana.test(nimi[`${hakuehto}`]))})])
      }))}>HAKUEHTO </button>

      <button onClick={() => {

        // let array1 = paketti.map((tieto : any, idx : number) => {
        //   return (tieto.data.data.filter((nimi : any) => {return nimi["2"]}))
        //   })

        let array1 = paketti.map((tieto : any, idx : number) => {
        return (tieto.data.data.map((sisalto : any) => {return [tieto.tiedostonimi, sisalto["0"]]}))
        })

        let nimet = Array.from(array1.flat(), (el : any) => el["1"])
        let filtteroitava = Array.from(array1.flat(), (el : any) => el["1"])
        let setti = Array.from(new Set(nimet))

        for (let i = 0; i < setti.length; i++){
          filtteroitava.splice(filtteroitava.indexOf(setti[i]), 1)
        }

        // console.log(array1)
        // console.log(nimet)

        setDuplicates(array1.flat().filter((el : any) => new Set(filtteroitava).has(el["1"]) === true))
        console.log(duplicates.sort((a : any, b : any) => {return a[1] - b[1]}))


      }}>DUPLIKAATIT </button>

      <button onClick={() => {console.log(duplicates)}}>DATA</button>
      <button onClick={() => {console.log(hakuehtoRef!.current!.value)}}>TEST</button>

      { (paketti.length > 0)
      ?
      <>
        <FormControl sx={{width:"100%"}}>
        <TextField inputRef={hakuehtoRef} variant="outlined" id="tekstikentta"/>
        <FormLabel id="demo-radio-buttons-group-label">Hakuehto</FormLabel>
            <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="0"
            name="radio-buttons-group"
            onChange={(e) => {setHakuEhto(e.target.value)}}
            >
            <FormControlLabel value="0" control={<Radio />} label="Tuotenumero" />
            <FormControlLabel value="2" control={<Radio />} label="Tuotenimi" />
            </RadioGroup>
        </FormControl>
      {(searchResults.length > 0)
      ? <Searchresults/>
      : <Taulukko/>
      }
      </> 
      : <Typography>Aloita lisäämällä yksi tai useampi tiedosto</Typography>
      }
    </Container>
  );
}

export default App;
