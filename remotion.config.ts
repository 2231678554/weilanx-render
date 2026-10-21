import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
import os from 'node:os';
Config.setConcurrency(Math.min(4, os.cpus().length));
Config.setChromiumOpenGlRenderer('swangle');
