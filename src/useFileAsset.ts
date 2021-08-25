import { useEffect, useState, useMemo } from 'react';
import { FileEntry } from './file.entry';
import FileAsset, { FileAssetInfo } from './file.asset';
import AbstractFileSystem from './abstract.file.system';

function useFileAsset (media: FileEntry, fileSystem: AbstractFileSystem<any, any>) {
  const asset = useMemo(() => FileAsset.create(media, fileSystem), []);
  const [info, setInfo] = useState(undefined as FileAssetInfo<any> | undefined);

  const state = useMemo(() => { return { info, asset }; }, [info, asset]);

  useEffect(() => {
    asset.on('change', (info: FileAssetInfo<any>) => {
      setInfo(info);
    });
    asset.getInfo().then(i => setInfo(i));
  }, []);

  return state;
}

export default useFileAsset;
