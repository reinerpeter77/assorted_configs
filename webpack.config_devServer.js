

// WEBPACK.CONFIG HAS SEVERAL VERSIONS, CONFIGURED BY (UN)COMMENTING VARIOUS LINES. OTHERWISE IDENTICAL.
// NOT ME >>>  file webpack.config_build.js. This version for creating bundle.js for export
// ME >>> webpack.config_devServer.js. This version for running webpack server for development, and for local import of package "npm install ../libproject/npmdist", or run by click on index.html

// Function: pack all js files into a single minified .js file.

// COMMAND LINE EXAMPLES FOR ALL VERSIONS OF THIS FILE
// *** RUN THESE FROM THE "CODE" FOLDER ! ******
// // directs webpack to serve the application for development, with auto build when source is modified:
// ME >>  node node_modules/webpack/bin/webpack serve -c ./webpack.config_devServer.js  
// // directs webpack to build the bundle.js (or other name) file out of many source files
// // for publishing/export. Typically called from scripts/builddist. Omits React.js libraries
// // to prevent conflict with client copies.
// NOT ME >> node node_modules/webpack/bin/webpack build -c ./webpack.config_build.js  
// ref: "https://webpack.js.org/configuration/module" used this to try do decipher whats going on here.

// TODO: set this variable to start page on browser which gets opened
var START_AT = '/sensorapis/sensor_orientat?mwmfont=24.3px'
const path = require('path');
const fs = require('fs'); // for ssl certificate 05/2025

// to include my plugin. Not required I did it for fun.
var MyWebpackPlugin_shows_URL_as_qrcode = require('./webpackUtils/MyWebpackPlugin_shows_URL_as_qrcode');

module.exports = 
{
  // entry means "start dependency graph at this file", which follows casading import()'s
  // The server serves up index.html which has <script src="/bundle_localdev.js" 
  // Above script has effect of running all loose javascript commands not inside functions, in all files.
  // NOTE: when webpack is run in "serve" mode, the bundle.js file is NOT physically created, instead it somehow
  // makes the calling HTML file think it exists.
  
  // for production bundle, having only library functions
  // NOT ME >>   entry: '../src/PackageTreeEntry.js',
  
  // for development bundle, include dev React startup code (has ReactDOM.createRoot(... ) plus the 
  //    tree entry point.
  entry: ['./src/index.js'],
  // entry: ['./webpackServerDevApp/forDevBundle/startReactInDiv.js', '../src/PackageTreeEntry.js'],

  // below entry does nothing. It only serves as point to start dependency graph to build bundle
  // entry: '../src/PackageTreeEntry.js',
  optimization: {
    // NOT ME >>    minimize: true // human readable if minimize if false
    minimize: false
  },
  devtool: 'eval-source-map', // 'eval-cheap-source-map',  // to get chrome debugger line number in code to line up
  mode: 'development',  // development or production
  // resolve is a fancy way of saying "look here for files to build graph". Extensions says use .js .jsx 
  resolve: { 
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  // setup where to put minified output file "the bundle", and any assets like jpegs. 
  output: {
    // NOT ME path: path.resolve(__dirname, '../../publicProj/npmjs_com/bundle-publish-public'), , // originally dist-webpack

    // Resulting bundle file is NOT USED and can cause confusion.
    // Here is the line to create the bundle file anyway. Note the "build" (not run) argument
    // node ./node_modules/webpack/bin/webpack build -c ./webpack.config_devServer.js
    // path: path.resolve(__dirname, 'webpackServerDevApp'), 
    path: path.resolve(__dirname, 'zzzzz'), 

    // NOT ME filename: 'bundle.js', // name of combined file, the "bundle"
    // ME THIS FILENAME IS VIRTUAL BY THE DEV SERVER IT DOES NOT ACTUALLY EXIST
    filename: 'bundle_webpackServer.js',
    // https://webpack.js.org/configuration/output/#outputlibrarytype
    // library type 'window' will not create a bundle file. It's for running as a server, or clicking on index.html.
    // I think it means "make library available via the DOM window object"
    library: { name: 'webPackLibraryVisibleFromDomWindowObject' , type: 'window' } 
    // type: 'commonjs2' works on client but not local serve or clicking on index.html
    // NOT ME >>  library: { type: 'commonjs2' } 
  },

  // plugin here is a way to run javascript code during build
  // this shows url as a qrcode on console using IP address for mobile dev. Not required I did it for fun.
  plugins: [
    // this one gets rid of annoying "download devtools" message..
    //new (require('webpack')).DefinePlugin({'__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'}),
    // my own plugin to show qr code ascii in console for mobile viewing
    // new MyWebpackPlugin_shows_URL_as_qrcode({ options: true, urlpath: ':3003/x15/x15?mwmfont=24.7px' })],
    new MyWebpackPlugin_shows_URL_as_qrcode({ options: true, urlpath: ':3003' + START_AT })],

  // the 'npx create-react-app my-app' thing uses HtmlWebpackPlugin to insert 
  // something like ' <script src="/bundle_webpackServer.js"></script>' into index.html before running so
  // so the coder does not have to. I didn't know why the script tab was not needed and thought
  // I was doing something wrong so searched how they did it and found this.
  // Not using it because its a confusing useless thing to do; put script tag into index.html instead!
  // Leave this comment here because it took hours to find how they did it.
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     //inject: true,
  //     title: 'zzbb',
  //     // template: 'bundle_webpackServer.js'
  //     template: './webpackServerDevApp/index.js'
  //   })
  // ],
  
  // *********************************************************************************************************
  // *** "EXTERNALS" FIXES ERROR ON CLIENT: WHEN REACT CONTROL IMPORTED FROM BUNDLE CALLS useEffect(), GET ***
  // ***  ERROR  MESSAGE ABOUT DUPLICATE COPIES OF REACT. BELOW ENTRY SAYS DONT BUNDLE REACT, JUST USE     ***
  // ***  CLIENT'S COPY OF REACT FOR THE GIVEN LIBRARY/TYPE ENTRIES.                                       ***
  // *** [OK for npmjs publish but not local bundle or wedpack development server]                                                       ***
  // *** https://webpack.js.org/configuration/externals/                                                   ***
  // *** "The externals configuration option provides a way of excluding dependencies from the output      ***
  // *** bundles. Instead, the created bundle relies on that dependency to be present in the consumer's    ***
  // *** (any end-user application) environment. ..."                                                      ***
  // *********************************************************************************************************
  // // NOT ME >>    
  // externals: {        
  //   react: {          
  //       commonjs: 'react',          
  //       commonjs2: 'react',          
  //       amd: 'React',          
  //       root: 'React',      
  //   },      
  //   'react-dom': {          
  //       commonjs: 'react-dom',          
  //       commonjs2: 'react-dom',          
  //       amd: 'ReactDOM',          
  //       root: 'ReactDOM',      
  //   },  
  // },

  // modules appears to be chunks of processing to do. 
  // In this case, there's 1 module which calls babel to convert jsx in React source to plain js
  module: {
    rules: [  // here's the first rule in the array of rules

      ////////////////////    
      { // feb 2025 added for sass, the css stylesheet thing
        test: /\.(scss|sass)$/,        
        use: [ 'style-loader',  'css-loader', 'sass-loader' ] 
      },
      //////////////////
      
      { // jan 2025 typescript added. START of the babel rule
        test: /\.(js|jsx|ts|tsx)$/,   // feed files *.js and *.js to babel. ref:https://webpack.js.org/configuration/module/#ruletest
        // not needed... include: [  path.resolve(__dirname, "src/zzz"), path.resolve(__dirname, "src/abc") ],
        exclude: /node_modules/, // dont send these hundreds of files to babel! Client will download these itself upon "npm i"
        use: {  // ref: https://webpack.js.org/configuration/module/#ruleuse
            loader: 'babel-loader', // node_modules/babel-loader/lib runs something here ...?
            // NOTE: options can be left out but you need a .babelrc with same presets.
            //       If you leave out both things, get fail without a description of whats wrong
            // 1/2024 added @babel/preset-typescript for typescript and ts 
            options: { 
              "presets": ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"]
              // for "optionalChainingAssign" error, but not needed. See comment in source ,"plugins": [ "@babel/plugin-proposal-optional-chaining" ]
            }
        }, 
      }, // END of the babel rule

      // { // START of the babel rule
      //   test: /\.(js|jsx)$/,   // feed files *.js and *.js to babel. ref:https://webpack.js.org/configuration/module/#ruletest
      //   // not needed... include: [  path.resolve(__dirname, "src/zzz"), path.resolve(__dirname, "src/abc") ],
      //   exclude: /node_modules/, // dont send these hundreds of files to babel! Client will download these itself upon "npm i"
      //   use: {  // ref: https://webpack.js.org/configuration/module/#ruleuse
      //     loader: 'babel-loader', // node_modules/babel-loader/lib runs something here ...?
      //     // NOTE: options can be left out but you need a .babelrc with same presets.
      //     //       If you leave out both things, get fail without a description of whats wrong
      //     options: { "presets": ["@babel/preset-env", "@babel/preset-react"] }
      //   }, 
      // }, // END of babel rule

      {  // this rule includes .css files
        test: /\.css$/,
        use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' }
        ]
      }

    ]
  },
  // devServer does not apply to build
  // https://webpack.js.org/configuration/dev-server/#devserverclient
  devServer: {
    https: true, // location on browser is denied if not https

    // // 05 2025
    // https: {
    //   key: fs.readFileSync('./webpackUtils/sslCert_work/mykey.key'),
    //   cert: fs.readFileSync('./webpackUtils/sslCert_work/mycert.crt'),
    // },

    // allowedHosts: ['.host.com', 'host2.com'],
    // OK for only one static dir...    static: path.join(__dirname, './publicProj/npmjs_com/bundle-publish-public'), // originally dist-webpack
    static: [
      // specify folder for webpack server to use as root to serve from
      // also index.html should go here, which has tags to invoke bundle
      path.join(__dirname, 'public'),  // for jpegs
    ],
    // devServer.historyApiFallback if true returns index.html instead of 404. 
    // I think React.js needs this because the webpack server doesn't know how to handle http://zzz/aa/bb/cc
    // and it gives a 404. Instead, it passes it to index.html which hands it to the React router 
    // which knows how to route the request by path.
    historyApiFallback: true, 
    compress: true,
    port: 3003, 
    host: 'local-ip', // makes open.target go to the IP, not localhost. Good if app has QR code.
    // https://webpack.js.org/configuration/dev-server/#devserveropen
    // open: false, //true, // Tells dev-server to open the browser
    // below opens chrome to specific url
    // 
    open: { target: [ START_AT ], 
            app: { name: 'msedge' // microsoft edge
            // app: { name: 'chrome'
            // infinite tabs!!   , arguments: ' --auto-open-devtools-for-tabs' 
          }},
    client: {
      logging: 'error', //'info', // set log level
      overlay: {
        errors: true,
        // if warnings true, page in browser starts with a warning popup, its just warnings but looks like a crash!
        warnings: false, 
        runtimeErrors: true,
      },
    },
  }
};

