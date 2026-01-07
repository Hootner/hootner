#!/bin/bash

IMAGE_DIR="./images"
CONTAINER_DIR="./containers"

create_image() {
    name=$1
    mkdir -p "$IMAGE_DIR/$name/rootfs"
    echo "Image $name created"
}

run_container() {
    image=$1
    cmd=$2
    id=$(date +%s)
    
    mkdir -p "$CONTAINER_DIR/$id"
    cp -r "$IMAGE_DIR/$image/rootfs" "$CONTAINER_DIR/$id/"
    
    unshare --fork --pid --mount-proc \
        chroot "$CONTAINER_DIR/$id/rootfs" $cmd
    
    echo "Container $id stopped"
}

list_containers() {
    ls -1 "$CONTAINER_DIR" 2>/dev/null || echo "No containers"
}

remove_container() {
    id=$1
    rm -rf "$CONTAINER_DIR/$id"
    echo "Container $id removed"
}

case "$1" in
    create)
        create_image "$2"
        ;;
    run)
        run_container "$2" "$3"
        ;;
    ps)
        list_containers
        ;;
    rm)
        remove_container "$2"
        ;;
    *)
        echo "Usage: $0 {create|run|ps|rm} [args]"
        ;;
esac
