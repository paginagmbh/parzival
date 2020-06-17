## Requirements

Clone and set up the shared password store, e.g.

    git clone git@code.pagina.gmbh:pagina-dh/dh-password-store.git
    export PASSWORD_STORE_DIR=$(pwd)/dh-password-store

## Configure Environment

    export DO_API_TOKEN=$(pass DigitalOcean/API-Token)

## Test

    ansible all -m ping -o
