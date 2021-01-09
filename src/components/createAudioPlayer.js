
export const createAudioPlayer = (file) => {
    const audioPlayer = new Audio(file);

    const play = () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    }

    return [play];
}
