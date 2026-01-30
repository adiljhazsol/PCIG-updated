@echo off
pushd "%~dp0PCIG_Backend"
call composer %*
popd
