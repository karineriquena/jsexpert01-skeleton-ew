ASSETSFOLDER=assets/timeline

for mediaFile in `ls $ASSETSFOLDER | grep .mp4`; do
    # echo $mediaFile
    # cortar a extensao e a resolucao do arquivo
    FILENAME=$(echo $mediaFile | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')
    INPUT=$ASSETSFOLDER/$mediaFile
    FOLDER_TARGET=$ASSETSFOLDER/$FILENAME
    mkdir -p $FOLDER_TARGET

    # criar arquivos de resolucoes diferentes na pasta
    OUTPUT=$ASSETSFOLDER/$FILENAME/$FILENAME
    DURATION=$(ffprobe -i $INPUT -show_format -v quiet | sed -n 's/duration=//p')

    OUTPUT144=$OUTPUT-$DURATION-144
    OUTPUT360=$OUTPUT-$DURATION-360
    OUTPUT720=$OUTPUT-$DURATION-720

    echo 'rendering in 720'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 1500k \
        -maxrate 1500k \
        -bufsize 1000k \
        -vf "scale=-1:720" \
        $OUTPUT720.mp4 \
        -v quiet

    echo 'rendering in 360'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 400k \
        -maxrate 400k \
        -bufsize 400k \
        -vf "scale=-1:360" \
        $OUTPUT360.mp4 \
        -v quiet

    echo 'rendering in 144'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 300k \
        -maxrate 300k \
        -bufsize 300k \
        -vf "scale=256:144" \
        $OUTPUT144.mp4 \
        -v quiet

    echo $OUTPUT144
    echo $OUTPUT360
    echo $OUTPUT720
done
