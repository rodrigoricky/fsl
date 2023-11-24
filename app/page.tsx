"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDemoModal } from "@/components/home/demo-modal";
import Webcam from "react-webcam";
import service from '../public/service';
import React from "react";

const maxVideoSize = 224;
const THRESHOLD = 5;
const THRESHOLDS = { S: 3, E: 5, A: 5, N: 6, R: 5 };
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 'N', "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",'Y', "Z", '_NOTHING', '_SPACE'];

export default function Home() {
  const { DemoModal, setShowDemoModal } = useDemoModal();
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>("prompt");
  const permissionName = "camera" as PermissionName;

  useEffect(() => {
    navigator.permissions.query({name: permissionName }).then(function(permissionStatus) {
      setPermissionStatus(permissionStatus.state);
      if (permissionStatus.state == 'denied' ) {
        setShowDemoModal(true)
        console.log('Permission to use camera is denied');
      } else if (permissionStatus.state == 'prompt') {
        console.log('Permission to use camera is prompt');
      }

      permissionStatus.onchange = function() {
        setPermissionStatus(this.state);
        if (this.state == 'denied') {
          setShowDemoModal(true);
        } else {
          setShowDemoModal(false);
        }
      };
    });
  }, []);


  let pText = '', pLetter = ''; pText = 'No Text Detected', pLetter = 'No Letter Detected'

  /* ----- */
  const videoElement = useRef<HTMLVideoElement>(null!);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const outputCanvasEl = useRef<HTMLCanvasElement>(null);
  let [letter, setLetter] = useState<String>('');
  let [loading, setLoading] = useState(true);
  let [words, setWords] = useState('');

  /**
   * In the onClick event we'll capture a frame within
   * the video to pass it to our service.
   */
  async function processImage() {
    if (
      videoElement !== null &&
      canvasEl !== null &&
      typeof videoElement.current !== 'undefined' &&
      videoElement.current !== null
    ) {
      let start = Date.now();
      let prevLetter = '';
      let count = 0;
      let _words = '';

      const processWord = () => {
        let wordsSplit = _words.split(' ');
        fetch(`https://sgnn.vercel.app/api/autocorrect?word=${wordsSplit[wordsSplit.length - 1]}`)
          .then((res) => res.json())
          .then((json) => {
            const correctedWord = json['correctedWord'];
            speechSynthesis.speak(new SpeechSynthesisUtterance(correctedWord));
            wordsSplit.pop();
            _words =
              wordsSplit.join(' ') + ' ' + correctedWord.toUpperCase() + ' ';
            setWords(
              wordsSplit.join(' ') + ' ' + correctedWord.toUpperCase() + ' '
            );
          });
      };

      videoElement.current.addEventListener('ended', processWord);

     

      while (true) {

        const ctx = canvasEl.current?.getContext('2d');
        ctx?.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
        const image = ctx?.getImageData(0, 0, maxVideoSize, maxVideoSize);
       

        // Processing image
        const processedImage = await service.imageProcessing(image);
        // Render the processed image to the canvas
        const ctxOutput = outputCanvasEl.current?.getContext('2d');
        ctxOutput?.putImageData(processedImage.data.payload, 0, 0);

        const prediction = await service.predict(processedImage.data.payload);

        const predictedLetter = prediction.data.payload;
        const letterValue = LETTERS[predictedLetter];

        setLetter(letterValue);
        if (letterValue !== prevLetter) {
          if (
            !THRESHOLDS[prevLetter as keyof typeof THRESHOLDS]
              ? count > THRESHOLD
              : count > THRESHOLDS[prevLetter as keyof typeof THRESHOLDS]
          ) {
            if (prevLetter === '_SPACE') processWord();
            else {
              _words = _words + (prevLetter === '_NOTHING' ? '' : prevLetter);
              setWords((prevState: string) => prevState + (prevLetter === '_NOTHING' ? '' : prevLetter));
            }
          }
          count = 0;
        } else {
          count++;
        }
        prevLetter = letterValue;
      }
    }
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    async function initCamera() {
      if (videoElement.current) {
        videoElement.current.width = maxVideoSize;
        videoElement.current.height = maxVideoSize;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        });
        videoElement.current!.srcObject = stream;

        return new Promise((resolve) => {
         
            videoElement.current!.onloadedmetadata = () => {
              resolve(videoElement.current);
            };
          
        });
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera';
      alert(errorMessage);
      return Promise.reject(errorMessage);
    }

    async function load() {
      const videoLoaded = await initCamera();
      await service.load();
      (videoLoaded as HTMLVideoElement)?.play();
      setTimeout(processImage, 0);
      setLoading(false);
      return videoLoaded;
    }

    load();
  }, []);

  
  return (
    <>
      <DemoModal />
      <div className="z-10 w-full max-w-xl px-5 xl:px-0">
        <a
          href="https://log.rky.me"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 flex max-w-fit animate-fade-up items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-7 py-2 transition-colors hover:bg-blue-200"
        >
          <p className="text-sm font-semibold text-[#1d9bf0]">
            View Project Timeline
          </p>
        </a>
        <h1
          className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-7xl md:leading-[5rem]"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          Sign Language Translator
        </h1>
        <p
          className="mt-6 animate-fade-up text-center text-gray-500 opacity-0 [text-wrap:balance] md:text-xl"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          Developing a Webcam-Driven AI for Translating Filipino Sign Language to Text
        </p>
        
      </div>

      <div className="z-10 w-full max-w-xl px-6 xl:px-0 mt-14">
        
      {permissionStatus === "prompt" ? (
      <div
        className="text-center -auto mt-2 flex animate-fade-up items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105"
              >
            Please grant webcam permission to use the sign language translator.
          </div>
        ) : (
          <>
            <video
              className="mx-auto mt-2 flex animate-fade-up items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105"
              playsInline
              ref={videoElement}
            />

            <div style={{ display: loading ? "none" : "block" }}>
              <div className="row justify-content-center">
                <div className="col-xs-12 text-center">
                  <canvas
                    style={{ display: "none" }}
                    ref={canvasEl}
                    width={maxVideoSize}
                    height={maxVideoSize}
                  />
                  <canvas
                    className="col-xs-12"
                    style={{ display: "none" }}
                    ref={outputCanvasEl}
                    width={maxVideoSize}
                    height={maxVideoSize}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="mx-auto mt-6 flex animate-fade-up items-center justify-center space-x-5 opacity-0 font-medium" style={{ animationFillMode: "forwards" }} >
          <a className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black" > 
            <p>Predicted Letters</p>
          </a>
        </div>

        <a className="mx-auto mt-2 flex animate-fade-up max-w-fit items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105">
          <p className="font-medium text-gray-600">{letter}</p>
        </a>

        <div className="mx-auto mt-6 flex animate-fade-up items-center justify-center space-x-5 opacity-0 font-medium mt-12" style={{ animationFillMode: "forwards" }} >
          <a className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-emerald-500 bg-emerald-500 px-6 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black" > 
            <p>Predicted Words</p>
          </a>
        </div>

        <a className="mx-auto mt-2 flex animate-fade-up max-w-fit items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-10 py-3 transition-all duration-75 hover:scale-105" >
          <p className="font-bold text-gray-600">{words}</p>
        </a>

      </div>
    </>
  );
}