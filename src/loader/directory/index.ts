import { constants } from '../../constants';
import { Directory, DirectoryConfig, Script, ScriptConfig } from '../../types';
import { PathUtils } from '../../utils';
import { validateDirectoryConfig, validateScriptConfig } from '../../validation';

const loadScriptConfig = (path: string, fileName: string, fileNames: string[]) => {
  const scriptConfigFileName = `${PathUtils.getFileNameWithoutExtension(fileName)}${SCRIPT_CONFIG_FILE_NAME_SUFFIX}`;
  let config;
  if (fileNames.includes(scriptConfigFileName)) {
    config = PathUtils.getJsonFile(PathUtils.resolve(path, scriptConfigFileName)) as ScriptConfig;
  }
  if (config) {
    validateScriptConfig(config, PathUtils.resolve(path, scriptConfigFileName));
  }
  return config;
};

const SCRIPT_CONFIG_FILE_NAME_SUFFIX = `.${constants.programName}.json`;
const loadScripts = (path: string): Script[] => {
  const fileNames = PathUtils.getFileNames(path);
  const scripts: Script[] = [];
  for (const fileName of fileNames) {
    if (fileName.endsWith(SCRIPT_CONFIG_FILE_NAME_SUFFIX)) {
      continue;
    }
    const script: Script = {
      name: PathUtils.getFileNameWithoutExtension(fileName),
      path: PathUtils.resolve(path, fileName),
      extension: PathUtils.getFileExtensionWithoutFileName(fileName),
      config: loadScriptConfig(path, fileName, fileNames),
      executable: PathUtils.isFileExecutable(PathUtils.resolve(path, fileName))
    };
    scripts.push(script);
  }
  return scripts;
};

const DIRECTORY_CONFIG_FILE_NAME = `.${constants.programName}.json`;
const loadDirectoryConfig = (path: string): DirectoryConfig | undefined => {
  const fileNames = PathUtils.getFileNames(path);
  if (fileNames.includes(DIRECTORY_CONFIG_FILE_NAME)) {
    const config = PathUtils.getJsonFile(PathUtils.resolve(path, DIRECTORY_CONFIG_FILE_NAME)) as DirectoryConfig;
    validateDirectoryConfig(config, PathUtils.resolve(path, DIRECTORY_CONFIG_FILE_NAME));
    return config;
  }
  return undefined;
};

export const loadDirectory = (path: string): Directory => {
  const name = PathUtils.getDirectoryName(path);
  const config = loadDirectoryConfig(path);
  const scripts = loadScripts(path);
  const directoryNames = PathUtils.getDirectoryNames(path);
  const directories = directoryNames.map((directoryName) => loadDirectory(PathUtils.resolve(path, directoryName)));
  const directory: Directory = {
    name,
    path,
    scripts,
    directories,
    config
  };
  return directory;
};