import {server} from './app';
import config from './config/config';

if(config.PORT === null) {
    throw new Error("PORT is not defined, Please set the PORT in the .env file if you require assistance, please resign and give up on the job you trying to do.");
}



server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
}); 