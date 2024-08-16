import './App.css';
import React from "react"
import { useGlobalAudioPlayer } from 'react-use-audio-player';

const App = () => {
  const [isPlaying, setPlaying] = React.useState(false);
  const [stationKey, setStationKey] = React.useState("hitradio");
  const stations = {
    hitradio: {
      station: "Hit Rádió",
      url: "https://streamer.radio.co/s47952d7c4/listen",
    },
    gospel24: {
      station: "Gospel24",
      url: "https://s3.radio.co/s0f9e837e7/listen",
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
  let stationName = stations[stationKey].station
  let stationURL = stations[stationKey].url
  let stationAPIURL = stationAPIs[stationKey].url

  const [currentlyPlaying, setCurrentlyPlaying] = React.useState("Műsorinformáció betöltése..");
  const fetchInfo = async () => {
    let response = await fetch(stationAPIURL);
    let data = await response?.json();
    let current = data?.data?.title;
    setCurrentlyPlaying(current);
  }

  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setMuted] = React.useState(false);

  const player = useGlobalAudioPlayer();
  React.useEffect(() => {
    player.load(stationURL, {
      autoplay: false,
      html5: true,
      format: 'mp3',
      volume: 0.8
    });

    fetchInfo()
  }, [stationKey])

  React.useEffect(() => {
    setTimeout(fetchInfo, 2000)
  }, [currentlyPlaying])

  const handlePlay = () => {
    player.play()
    setPlaying(true);
    console.log("play")
  }

  const handlePause = () => {
    player.pause()
    setPlaying(false);
    console.log("pause")
  }

  const toggle = () => {
    isPlaying ? handlePause() : handlePlay()
    console.log("toggle")
  }

  const handleVolumeChange = (e) => {
    setVolume(e.target.value / 100);
    player.setVolume(e.target.value / 100)
  }

  const handleMuteToggle = () => {
    isMuted ? player.setVolume(volume) : player.setVolume(0)
    setMuted(!isMuted);
  }

  return (
    <>
      <div className="App w-[100%]">
        <div
          className="bg-[#566efd] flex flex-row justify-between items-center gap-6 py-4 px-6 rounded-xl"
        >
          <div className='flex flex-row items-center flex-start gap-6'>

            <a href="#" className="playButton flex-3" onClick={toggle}>
              {isPlaying ? (
                <i className="fa-solid fa-pause text-white text-4xl"></i>
              ) : (
                <i className="fa-solid fa-play text-white text-4xl"></i>
              )}
            </a>
            <div className="info text-left text-white flex-6">
              <h1 className='font-bold'>
                {stationName}
              </h1>
              <p>
                {currentlyPlaying}
              </p>
            </div>
          </div>
          <div className='flex flex-row items-center flex-start gap-6'>
            <div className='flex-3 flex flex-row items-center gap-2 rounded-lg border-white border-2 py-2 px-4 border-solid bg-[#4c63e8]'>
              <i class="fa-solid fa-arrow-right-arrow-left text-white text-lg"></i>
              <h1 className='text-white font-bold'>
                {stationKey === "hitradio" ? <a href="#" onClick={() => setStationKey("gospel24")}> {stations["gospel24"].station} </a> : <a href="#" onClick={() => setStationKey("hitradio")}> {stations["hitradio"].station} </a>}
              </h1>
            </div>
            <div className='flex-3 flex flex-row  items-center gap-4'>
              {isMuted || volume === 0 ? <a href='#' class="fa-solid fa-volume-xmark text-white text-lg" onClick={handleMuteToggle}></a> :
                volume < 0.4 ? <a href="#" class="fa-solid fa-volume-off text-white text-lg" onClick={handleMuteToggle}></a> :
                  volume < 0.8 ? <a class="fa-solid fa-volume-low text-white text-lg" onClick={handleMuteToggle}></a> :
                    <a href='#' class="fa-solid fa-volume-high text-white text-lg" onClick={handleMuteToggle}></a>}
              <input id="default-range" type="range" value={volume * 100} onChange={handleVolumeChange} class="w-full h-2 accent-white bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"></input>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;