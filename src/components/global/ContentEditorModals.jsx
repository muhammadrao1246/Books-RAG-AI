
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, IconButton } from "@mui/material";
import { tokens } from "src/theme";
import { useOutletContext, useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChapterDetailMutation, useGetReelsDetailMutation, useUpdateEpisodeChapterMutation, useUpdateReelMutation } from "src/services/api";
import { ClosableToast } from "src/components/global/Toast";
import { secondsToTimeString } from "src/components/global/RangeSlider";
import { debounce } from "lodash";
import SequenceContentBox from "src/components/global/SequenceContentBox";
import { ButtonFilledOutlinedStyles } from "src/utils/utils";
import { RedoOutlined, Undo, UndoOutlined, UndoRounded } from "@mui/icons-material";

export const ChapterContentEditor = React.memo(function ChapterContentEditor({open, setOpen, episodeId, chapterId, title, startSeq, endSeq, startTime, endTime, refresher}){
    const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));



//   const handleOpen = () => setOpen(true);
  const handleClose = debounce((id) => {
        setOpen(false)
    }, 100)

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [chapterSequences, setChapterSequences] = React.useState([]);
  const editedSequences = React.useRef({});
  const deletedSequences = React.useRef(new Set())

  
  const [unActions, setUnActions] = React.useState([])
  const [reActions, setReActions] = React.useState([])
  

  const [getChapterDetail,] = useGetEpisodeChapterDetailMutation()
  const getChapterDetailFunc = async () => {
    setLoading(true)
    const response = await getChapterDetail({episodeId, chapterId})
    setLoading(false)
      if (!!response.error) {
          let dataObject = response.error.data;
          console.log(dataObject.errors);
          ClosableToast("Unable To Load Chapter Data. Try Again!", "error", 2000)
          handleClose()
      } else {
          let dataObject = response.data.data;
          setChapterSequences(dataObject.sequences)
      }
  }


  // fetch Chapter Details
  React.useEffect(()=>{
    getChapterDetailFunc()
  },[episodeId, chapterId])   


  const [updateChapter,] = useUpdateEpisodeChapterMutation()
  const handleSave = async (e) => {
    // all deleted sequences previous editing will not be saved
    deletedSequences.current.forEach(id=>delete editedSequences.current[id])
    let body = {
        sequences: chapterSequences.filter(seq=>!deletedSequences.current.has(seq.id)).map(seq => seq.id),
        start_sequence_number: startSeq,
        end_sequence_number: endSeq,
        edit_sequences: editedSequences.current,
        // deleted_sequences: Array.from(deletedSequences.current)
    };
    console.log(body)
    // return
    setLoading(true);
    
    requestAnimationFrame(async () => {
        const response = await updateChapter({episodeId, chapterId, body});
        
        if (!!response.error) {
            let dataObject = response.error.data;
            Object.keys(dataObject.errors).forEach((errorType) => {
                ClosableToast(dataObject.errors[errorType][0], "error", 2000);
            });
            setLoading(false);
        } else {
            handleClose();
            ClosableToast("Chapter Updated Successfully!", "success", 2000);
            setTimeout(() => {
                refresher();
            }, 1000);
        }
    });
};


  const addToUndo = (action) => {
    setUnActions((prev) => [...prev, action]);
    setReActions([]); // Clear redo stack when a new action is performed
  };

  
// will be recreated only one time when the chapterSequences is set and the function will be cached
const handleEdit = React.useCallback((id, newWords) => {
  // Capture current state before editing
  const previousWords = chapterSequences.find(seq => seq.id === id)?.words || '';
  addToUndo({ type: "edit", id, previousWords, newWords });
  // Proceed with editing
  editedSequences.current[id] = newWords;
  console.log("Edited", editedSequences.current);
}, [chapterSequences]);

// direct modifying the state are without creating a new so no need to add dependincies
const handleDelete = React.useCallback((id) => {
  // Capture current state before deleting
  const sequenceToDelete = chapterSequences.find(seq => seq.id === id);
  
  if (sequenceToDelete) {
    addToUndo({ type: "delete", id, sequence: sequenceToDelete });
    deletedSequences.current.add(id);
  }
  
  console.log(`Deleted: `, deletedSequences.current);
  

}, [chapterSequences]);


// accessing the updated states variables by defining them in dependencies
//  or by working with functional updates to work always with the latest ones states in all scenario
const handleUndoDelete = React.useCallback((id) => {
  // Restore the state before deletion
  deletedSequences.current.delete(id);

  // remove it from undo section to prevent it
  setUnActions(prev => [...prev.filter(seq=>!(seq.id == id && seq.type == "delete"))])
  console.log(`UnDeleted: `, deletedSequences.current);
}, []);

const handleAction = (action) => {
  if (action === "undo" && unActions.length > 0) {
    const lastAction = unActions.pop();

    if (lastAction.type === "edit") {
      const { id, previousWords } = lastAction;
      editedSequences.current[id] = previousWords; // Restore previous words
    } else if (lastAction.type === "delete") {
      const { id } = lastAction;
      handleUndoDelete(id); // Restore the deleted sequence
    }
    
    setUnActions([...unActions]);
    setReActions((prev) => [...prev, lastAction]);
  } else if (action === "redo" && reActions.length > 0) {
    const lastAction = reActions.pop();

    if (lastAction.type === "edit") {
      const { id, newWords } = lastAction;
      editedSequences.current[id] = newWords; // Apply the edit again
    } else if (lastAction.type === "delete") {
      const { id } = lastAction;
      deletedSequences.current.add(id); // Apply the delete again
    }
    
    setReActions([...reActions]);
    setUnActions((prev) => [...prev, lastAction]);
  }
  
  // console.log("Actions", unActions, reActions);
};

  
  // const handleDelete = React.useCallback(debounce((id) => {
  //       // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
  //       deletedSequences.current.add(id)
  //       console.log(`${id} Deleted: `, editedSequences.current, deletedSequences.current)
  //   }, 300), []);

  // const handleUndoDelete = React.useCallback(debounce((id) => {
  //       // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
        
  //       deletedSequences.current.delete(id)
  //       console.log(`${id} UnDeleted: `, editedSequences.current, deletedSequences.current)
  //   }, 300), []);
    
  return (
    <Dialog maxWidth="md" open={open} fullWidth={true} onClose={handleClose}>
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Edit {title}
        <Box display="flex" gap="1em">
          <IconButton title="Undo" onClick={()=>handleAction("undo")} disabled={unActions.length == 0} size="small">
            <UndoOutlined />
          </IconButton>
          <IconButton title="Redo" onClick={()=>handleAction("redo")} disabled={reActions.length == 0} size="small">
            <RedoOutlined />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
        //   mt="20px"
          borderRadius="10px"
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
            p="20px"
        //   sx={{ gridColumn: "span 3" }}
          className={`${chapterId}-edit-sequence-box`}
          sx={{
            
            maxHeight: "300px",
            overflow: "auto",
            scrollBehavior: "smooth",
          }}
        >
           <Box
           sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: "5px",
          }}> 
            {
                chapterSequences.length > 0 && chapterSequences.map((seq, index)=>(
                    <SequenceContentBox 
                                key={seq.id}
                                id={seq.id}
                                index={index}
                                word={seq.id in editedSequences.current ? editedSequences.current[seq.id] : seq.words}
                                sequence_number={seq.sequence_number}
                                isDeletedInList={deletedSequences.current.has(seq.id)}
                                onUndoDelete={()=>handleUndoDelete(seq.id)}
                                onEdit={handleEdit}
                                onDelete={()=>handleDelete(seq.id)}
                            />
                ))
            }
            </Box>
        </Box>
        <Box
          mt="20px"
          display="flex"
          justifyContent="space-between"
          gap="10px"
          alignItems="center"
          sx={{ gridColumn: "span 3" }}
        >
          <Typography
            borderRadius="10px"
            p="15px 20px"
            
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currStartTime, false)}
          </Typography>
          {/* <RangeSlider
            key={chapterId + "-add-reel-slider"}
            timeStamps={timeStamps}
            handleChange={handleChange}
            startTime={currStartTime}
            endTime={currEndTime}
            min_step={min_step}
          /> */}
          <Typography
            borderRadius="10px"
            p="15px 20px"
            
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currEndTime, false)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
              size="large"
              color="info"
              variant="outlined"
              onClick={handleClose}>Cancel</Button>
        <Button
              size="large"
              color="secondary"
              variant="contained"
              sx={{
              ...ButtonFilledOutlinedStyles(colors.greenAccent[400], colors.grey[900], false)
            }}
              onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
})


export const ReelContentEditor = React.memo(function ReelContentEditor({open, setOpen, episodeId, chapterId, reelId, title, startSeq, endSeq, startTime, endTime, refresher}){
    const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));



//   const handleOpen = () => setOpen(true);
  const handleClose = debounce((id) => {
        setOpen(false)
    }, 100)

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [reelSequences, setReelSequences] = React.useState([]);
  const editedSequences = React.useRef({});
  const deletedSequences = React.useRef(new Set())

  const [unActions, setUnActions] = React.useState([])
  const [reActions, setReActions] = React.useState([])
  

  const [getReelDetail,] = useGetReelsDetailMutation()
  const getReelDetailFunc = async () => {
    setLoading(true)
    const response = await getReelDetail({episodeId, chapterId, reelId})
    
      if (!!response.error) {
          let dataObject = response.error.data;
          console.log(dataObject.errors);
          ClosableToast("Unable To Load Reel Data. Try Again!", "error", 2000)
          handleClose()
      } else {
          let dataObject = response.data.data;
          setReelSequences(dataObject.sequences)
          console.log("Reels Sequences Loaded")
      }
    setLoading(false)
  }


  // fetch Chapter Details
  React.useEffect(()=>{
    getReelDetailFunc()
  },[episodeId, chapterId, reelId])   


  const [updateReel,] = useUpdateReelMutation()
  const handleSave = async (e) => {
      // all deleted sequences previous editing will not be saved
      deletedSequences.current.forEach(id=>delete editedSequences.current[id])
      let body = {
          sequences: reelSequences.filter(seq=>!deletedSequences.current.has(seq.id)).map(seq => seq.id),
          start_sequence_number: startSeq,
          end_sequence_number: endSeq,
          edit_sequences: editedSequences.current,
          // deleted_sequences: Array.from(deletedSequences.current)
      };
      console.log(body)
      // return
      setLoading(true);
      
      requestAnimationFrame(async () => {
          const response = await updateReel({episodeId, chapterId, reelId, body});
          
          if (!!response.error) {
              let dataObject = response.error.data;
              Object.keys(dataObject.errors).forEach((errorType) => {
                  ClosableToast(dataObject.errors[errorType][0], "error", 2000);
              });
              setLoading(false);
          } else {
              handleClose();
              ClosableToast("Reel Updated Successfully!", "success", 2000);
              setTimeout(() => {
                  refresher();
              }, 1000);
          }
      });
  }

const addToUndo = (action) => {
  setUnActions((prev) => [...prev, action]);
  setReActions([]); // Clear redo stack when a new action is performed
};

// will be recreated only one time when the reelSequences is set and the function will be cached
const handleEdit = React.useCallback((id, newWords) => {
  // Capture current state before editing
  const previousWords = reelSequences.find(seq => seq.id === id)?.words || '';
  addToUndo({ type: "edit", id, previousWords, newWords });
  // Proceed with editing
  editedSequences.current[id] = newWords;
  console.log("Edited", editedSequences.current);
}, [reelSequences]);

// direct modifying the state are without creating a new so no need to add dependincies
const handleDelete = React.useCallback((id) => {
  // Capture current state before deleting
  const sequenceToDelete = reelSequences.find(seq => seq.id === id);
  
  if (sequenceToDelete) {
    addToUndo({ type: "delete", id, sequence: sequenceToDelete });
    deletedSequences.current.add(id);
  }
  
  console.log(`Deleted: `, deletedSequences.current);
  

}, [reelSequences]);


// accessing the updated states variables by defining them in dependencies
//  or by working with functional updates to work always with the latest ones states in all scenario
const handleUndoDelete = React.useCallback((id) => {
  // Restore the state before deletion
  deletedSequences.current.delete(id);

  // remove it from undo section to prevent it
  setUnActions(prev => [...prev.filter(seq=>!(seq.id == id && seq.type == "delete"))])
  console.log(`UnDeleted: `, deletedSequences.current);
}, []);

const handleAction = (action) => {
  if (action === "undo" && unActions.length > 0) {
    const lastAction = unActions.pop();

    if (lastAction.type === "edit") {
      const { id, previousWords } = lastAction;
      editedSequences.current[id] = previousWords; // Restore previous words
    } else if (lastAction.type === "delete") {
      const { id } = lastAction;
      handleUndoDelete(id); // Restore the deleted sequence
    }
    
    setUnActions([...unActions]);
    setReActions((prev) => [...prev, lastAction]);
  } else if (action === "redo" && reActions.length > 0) {
    const lastAction = reActions.pop();

    if (lastAction.type === "edit") {
      const { id, newWords } = lastAction;
      editedSequences.current[id] = newWords; // Apply the edit again
    } else if (lastAction.type === "delete") {
      const { id } = lastAction;
      deletedSequences.current.add(id); // Apply the delete again
    }
    
    setReActions([...reActions]);
    setUnActions((prev) => [...prev, lastAction]);
  }
  
  // console.log("Actions", unActions, reActions);
};

React.useEffect(()=>{
  console.log("Actions", unActions, reActions);
},[unActions, reActions])

  return (
    <Dialog maxWidth="md" open={open} fullWidth={true} onClose={handleClose}>
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        Edit {title}
        <Box display="flex" gap="1em">
          <IconButton title="Undo" onClick={()=>handleAction("undo")} disabled={unActions.length == 0} size="small">
            <UndoOutlined />
          </IconButton>
          <IconButton title="Redo" onClick={()=>handleAction("redo")} disabled={reActions.length == 0} size="small">
            <RedoOutlined />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
        //   mt="20px"
          borderRadius="10px"
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
            p="20px"
        //   sx={{ gridColumn: "span 3" }}
          className={`${chapterId}-edit-sequence-box`}
          sx={{
            
            maxHeight: "300px",
            overflow: "auto",
            scrollBehavior: "smooth",
          }}
        >
           <Box
           sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: "5px",
          }}> 
              {
                  reelSequences.length > 0 && reelSequences.map((seq, index)=>(
                      <SequenceContentBox 
                                  key={seq.id}
                                  id={seq.id}
                                  index={index}
                                  word={seq.id in editedSequences.current ? editedSequences.current[seq.id] : seq.words}
                                  sequence_number={seq.sequence_number}
                                  isDeletedInList={deletedSequences.current.has(seq.id)}
                                  onUndoDelete={()=>handleUndoDelete(seq.id)}
                                  onEdit={handleEdit}
                                  onDelete={()=>handleDelete(seq.id)}
                              />
                  ))
              }
            </Box>
        </Box>
        <Box
          mt="20px"
          display="flex"
          justifyContent="space-between"
          gap="10px"
          alignItems="center"
          sx={{ gridColumn: "span 3" }}
        >
          <Typography
            borderRadius="10px"
            p="15px 20px"
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currStartTime, false)}
          </Typography>
          {/* <RangeSlider
            key={chapterId + "-add-reel-slider"}
            timeStamps={timeStamps}
            handleChange={handleChange}
            startTime={currStartTime}
            endTime={currEndTime}
            min_step={min_step}
          /> */}
          <Typography
            borderRadius="10px"
            p="15px 20px"
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currEndTime, false)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
              size="large"
              color="info"
              variant="outlined"
              onClick={handleClose}>Cancel</Button>
        <Button
              size="large"
              color="secondary"
              variant="contained"
              sx={{
              ...ButtonFilledOutlinedStyles(colors.greenAccent[400], colors.grey[900], false)
            }}
              // sx={{...ButtonFilledOutlinedStyles(colors.grey[100], colors.grey[900], false)}}
              onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
})