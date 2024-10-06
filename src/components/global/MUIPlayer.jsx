// Use the module manager to introduce plugins
import React from 'react'
import PropTypes from 'prop-types'
import { DropboxSharedToDownloadableConverter, TimeStampToSeconds } from 'src/utils/utils'
import ReactPlayer from 'react-player/file';




function MUIPlayer({src, startTime, endTime, controls=true, height="250px"}) {
    // console.log(src)
    const [isPlaying, setIsPlaying] = React.useState(false);

    const [isReady, setIsReady] = React.useState(false);
    const playerRef = React.useRef();
  
    // const onReady = React.useCallback(() => {
    //     console.log(playerRef)
    //   if (!isReady) {
    //     // const timeToStart = TimeStampToSeconds(startTime)
        
    //     const timeToStart = parseInt(startTime)
    //     console.log(timeToStart)
    //     playerRef.current.seekTo(timeToStart, "seconds");
    //     setIsReady(true);
    //   }
    // }, [isReady]);
    
  return (
    <ReactPlayer
    ref={playerRef}
    url={src}
    playing={isPlaying}
    pip={false}
    // light={true}
    width="100%"
    height={height}
    controls={controls}
    
    config={
        {
            attributes: {
              disablePictureInPicture: true,
              disableRemotePlayback: true,
            //   controlsList: "play volume",
            controllist: "nofullscreen nodownload noremoteplayback noplaybackrate"
            }
        }
    }
    
    // onReady={onReady}
    onPause={()=>playerRef.current.seekTo(parseInt(startTime))}
    />
  )
}

export default MUIPlayer