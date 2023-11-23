"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDemoModal } from "@/components/home/demo-modal";
import Webcam from "react-webcam";


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

  useEffect(() => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(() => {console.log('You let me use your camera!')}).catch(function(err) {console.log('No camera for you!', err)});
  }, []);
  
  let pText = ''
  pText = 'No Text Detected'

  let pLetter = ''
  pLetter = 'No Letter Detected'

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
          <div className="text-center -auto mt-2 flex animate-fade-up items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105">Please grant webcam permission to use the sign language translator.</div>
        ) : (
          <Webcam
            className="mx-auto mt-2 flex animate-fade-up items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105"
            disablePictureInPicture={true}
            audio={false}
            mirrored={false}
          />
        )}
        <div className="mx-auto mt-6 flex animate-fade-up items-center justify-center space-x-5 opacity-0 font-medium" style={{ animationFillMode: "forwards" }} >
          <a className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-blue-500 bg-blue-500 px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black" > 
            <p>Predicted Letters</p>
          </a>
        </div>

        <a className="mx-auto mt-2 flex animate-fade-up max-w-fit items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-all duration-75 hover:scale-105">
          <p className="font-medium text-gray-600">{pLetter}</p>
        </a>

        <div className="mx-auto mt-6 flex animate-fade-up items-center justify-center space-x-5 opacity-0 font-medium mt-12" style={{ animationFillMode: "forwards" }} >
          <a className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-emerald-500 bg-emerald-500 px-6 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black" > 
            <p>Predicted Words</p>
          </a>
        </div>

        <a className="mx-auto mt-2 flex animate-fade-up max-w-fit items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-10 py-3 transition-all duration-75 hover:scale-105" >
          <p className="font-bold text-gray-600">{pText}</p>
        </a>

      </div>
    </>
  );
}