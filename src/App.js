import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';
import React from "react"
import { useState, useEffect } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { faChevronDown, faChevronUp, faPause, faPlay, faSpinner, faVolumeHigh, faVolumeLow, faVolumeOff, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

const App = () => {
  const [isPlaying, setPlaying] = React.useState(false);
  const [stationKey, setStationKey] = React.useState("");
  const stations = {
    hitradio: {
      station: "Hit Rádió",
      url: "https://streamer.radio.co/s47952d7c4/listen",
      about: "/musorujsag",
    },
    gospel24: {
      station: "Gospel24",
      url: "https://s3.radio.co/s0f9e837e7/listen",
      about: "/gospel24",
    },
  };
  const stationAPIs = {
    hitradio: {
      station: "Hit Rádió",
      url: "https://public.radio.co/api/v2/s47952d7c4/track/current",
    },
    gospel24: {
      station: "Gospel24",
      url: "https://public.radio.co/api/v2/s0f9e837e7/track/current",
    },
  };
  let stationName = stations?.[stationKey]?.station
  let stationURL = stations?.[stationKey]?.url
  let stationAPIURL = stationAPIs?.[stationKey]?.url

  const [currentlyPlaying, setCurrentlyPlaying] = React.useState({
    hitradio: "Műsorinformáció betöltése...",
    gospel24: "Műsorinformáció betöltése...",
    biblia24: "Műsorinformáció betöltése...",
  });
  const fetchInfo = async () => {
    let newCurrentlyPlaying = { ...currentlyPlaying }
    await Object.entries(stationAPIs).map(async ([key, value]) => {
      let response = await fetch(value.url);
      let data = await response?.json();
      let current = data?.data?.title;
      newCurrentlyPlaying[key] = current;
    })


    setCurrentlyPlaying(newCurrentlyPlaying)
  }

  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setMuted] = React.useState(false);

  const player = useGlobalAudioPlayer();
  React.useEffect(() => {
    (async () => {
      if (stationURL === undefined) return

      player.load(stationURL, {
        autoplay: false,
        html5: true,
        format: 'mp3',
        volume: 0.8
      });

      //await fetchInfo()
    })();
  }, [stationKey])

  React.useEffect(() => {
    (async () => {
      setTimeout(async () => {
        await fetchInfo()
      }, 10000)
    })();
  }, [currentlyPlaying])

  const handlePlay = () => {
    setPlaying(true);
    player.play()
    console.log("play")
  }

  const handlePause = () => {
    setPlaying(false);
    player.pause()
    console.log("pause")
  }

  const toggle = () => {
    isPlaying ? handlePause() : handlePlay()
  }

  const handleVolumeChange = (e) => {
    setVolume(e.target.value / 100);
    player.setVolume(e.target.value / 100)
  }

  const handleMuteToggle = () => {
    isMuted ? player.setVolume(volume) : player.setVolume(0)
    setMuted(!isMuted);
  }

  const handleChangeStation = (newStationKey) => {
    setStationKey(newStationKey)
  }

  useEffect(() => {
    stationKey !== undefined && handlePlay()
  }, [stationKey])

  const { height, width } = useWindowDimensions();

  const [isRadioSelectOpen, setRadioSelectOpen] = useState(false);
  const toggleRadioSelectOpen = () => {
    setRadioSelectOpen(isOpen => setRadioSelectOpen(!isOpen));
  }

  return (
    <div className='all:initial App w-[100%] flex flex-col gap-3 items-center justify-center fixed bottom-3 drop-shadow-2xl'>
      <div className="flex flex-col gap-3 items-center justify-center p-3 drop-shadow-2xl">
        {isRadioSelectOpen && (
          <div className='flex flex-col items-start w-96 px-2 py-2 gap-1 justify-center bg-white drop-shadow-2xl rounded-xl'>
            {Object.entries(stations).map(([key, subject]) => (
              <div key={key} className='flex flex-row items-center overflow-hidden gap-2 py-1 px-2 w-full border-[#463bfb] border-[3px] box-border rounded-md text-[#463bfb] cursor-pointer' style={{ boxSizing: "border-box" }} onClick={() => handleChangeStation(key)}>
                <div className='basis-[20%]' key={isPlaying + player.isReady}>
                  {!player.isReady && stationKey === key ? (

                    <div role="status">
                      <FontAwesomeIcon icon={faSpinner} className="text-[#463bfb] text-xl animate-[spin_2s_linear_infinite]" fixedWidth />
                    </div>

                  ) : isPlaying && stationKey === key ? (
                    <FontAwesomeIcon icon={faPause} className="text-[#463bfb] text-lg" fixedWidth />
                  ) : (
                    <FontAwesomeIcon icon={faPlay} className="text-[#463bfb] text-lg" fixedWidth />
                  )}
                </div>
                <div className='text-left basis-[80%] leading-6 overflow-hidden'>
                  <p className='font-bold overflow-hidden m-0'>{subject.station}</p>
                  <p className='overflow-hidden m-0'>{currentlyPlaying[key]}</p>
                </div>
                <div>
                  <a href={stations[stationKey]?.about ?? "#"} className="cursor-pointer">
                    <FontAwesomeIcon icon="fa-solid fa-circle-info" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          className=" flex flex-row justify-between items-center gap-2 w-fit rounded-xl drop-shadow-2xl"
        >
          <div className='rounded-full bg-[#463bfb] py-3 px-3 cursor-pointer' onClick={toggle} >
            <a href="#" className="playButton flex-3" key={isPlaying + player.isReady}>
              {!player.isReady ? (

                stationKey === "" ? (
                  <FontAwesomeIcon icon={faPlay} className="text-white text-lg opacity-30" fixedWidth />
                ) : (

                  <div role="status">
                    <FontAwesomeIcon icon={faSpinner} className="text-white text-xl animate-[spin_2s_linear_infinite]" fixedWidth />
                  </div>
                )

              ) : isPlaying ? (
                <FontAwesomeIcon icon={faPause} className="text-white text-lg" fixedWidth />
              ) : (
                <FontAwesomeIcon icon={faPlay} className="text-white text-lg" fixedWidth />
              )}
            </a>
          </div>
          <div className='rounded-full bg-[#463bfb] py-3 px-12 items-center flex flex-row gap-6 cursor-pointer' onClick={toggleRadioSelectOpen} >

            <div className="info text-left text-white ">
              <h1 className='font-bold m-0 text-xl text-nowrap'>
                {stationName ?? "Válassz csatornát"}
              </h1>
            </div>
            <div className='flex flex-row items-center flex-start gap-6'>
              <div className='' key={isPlaying + player.isReady}>
                {
                  isRadioSelectOpen ? (
                    <FontAwesomeIcon icon={faChevronUp} className="text-white text-lg" />
                  ) : (
                    <FontAwesomeIcon icon={faChevronDown} className="text-white text-lg" />
                  )

                  //stationKey === "hitradio" ? <a href="#" onClick={() => handleChangeStation("gospel24")}> {stations["gospel24"].station} </a> : <a href="#" onClick={() => handleChangeStation("hitradio")}> {stations["hitradio"].station} </a>
                }
              </div>

            </div>
            {width > 1200 && (
              <div className='flex-3 flex basis-6 flex-row items-center gap-4 hidden sm:flex' key={isMuted + volume}>
                {isMuted || volume === 0 ?
                  <FontAwesomeIcon icon={faVolumeXmark} className="text-white text-lg cursor-pointer" onClick={handleMuteToggle} fixedWidth /> :
                  volume < 0.4 ?
                    <FontAwesomeIcon icon={faVolumeOff} className="text-white text-lg cursor-pointer" onClick={handleMuteToggle} fixedWidth /> :
                    volume < 0.8 ?
                      <FontAwesomeIcon icon={faVolumeLow} className="text-white text-lg cursor-pointer" onClick={handleMuteToggle} fixedWidth /> :
                      <FontAwesomeIcon icon={faVolumeHigh} className="text-white text-lg cursor-pointer" onClick={handleMuteToggle} fixedWidth />
                }
                <input id="default-range" type="range" value={volume * 100} onChange={handleVolumeChange} className="m-0 w-full border-0 p-0 m-0 h-2 accent-white bg-gray-200 rounded-lg appearance-none bg-transparent cursor-pointer dark:bg-gray-700 [&amp;::-webkit-slider-runnable-track]:rounded-full [&amp;::-webkit-slider-runnable-track]:bg-black/25 [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:h-[20px] [&amp;::-webkit-slider-thumb]:w-[20px] [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:bg-white"></input>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;