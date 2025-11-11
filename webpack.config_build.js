
// Function: pack all js files into a single minified .js file.

/* The tag "LAZYLOADING" flags all entries related or modified for:
    * "lazy loading" aka "dynamic loading" of bundles (more than one bundle created)
    * splitting of bundle*.js file into separate files. This allows bundles containing
      seldom used javascript to be loaded only when needed. Also means that packages used by
      these only get loaded when needed also. IE: three.js, a 3D web toolkit.
*/

/* COMMAND LINE EXAMPLES
   directs webpack to build the bundle.js (or other name) file out of many source files
   for publishing/export. Typically called from scripts/builddist. Omits React.js libraries
   to prevent conflict with client copies.
   node node_modules/webpack/bin/webpack build -c ./webpack.config_build.js  
*/

// ref: "https://webpack.js.org/configuration/module" used this to try do decipher whats going on here.
/* this is a javascript file which gets imported by webpack. It exports a big JSON thing. */
const path = require('path');  // this is so path.resolve() works to current fs location
const CopyWebpackPlugin = require('copy-webpack-plugin');

/* WARNING: SAVE "outDir" VERBATIM BECAUSE IT'S USED BY THE BUILD SCRIPT! */
const outDir='./nginx_host/webPackOut'

module.exports = // it's a normal javascript export stmt. In this case its a big JSON object to be used by webpack.
{
  /* entry means "start dependency graph at this file", which follows casading import()'s to see what to put in bundle.js
     The server serves up index.html which has <script src="/bundle_XYZ.js" ... which effectively
     runs anything in the bundle which is not in a function ("this is top level code").
     NOTE: when webpack is run in "serve" mode, the bundle.js file is NOT physically created, instead it somehow
     makes the calling HTML file think it exists. Must have to do with auto-refresh of edits etc...
  */
  
  // entry: './src/index.js',

  // LAZYLOADING done for lazy loading
  entry: {
    main: './src/index.js',    // Your main application code
    vendorMoose: ['./src/mwmFiles/LazyLoadStuff.js', 'three']  // Your third-party dependencies
  },

  optimization: {
    minimize: true, //false //true // human readable if minimize if false
    // splitChunks: {  // LAZYLOADING this breaks the build !?
    //   chunks: 'all'
    // }
    // Copilot: usedExports: This option enables tree shaking, which removes unused code from the bundle-> ,usedExports: true,
  },
  // NOT ME >> devtool: 'eval-source-map', // 'eval-cheap-source-map',  // to get chrome debugger line number in code to line up
  mode: 'production', 
  // mode: 'development',
  // resolve is a fancy way of saying "look here for files to build graph". Extensions says use .js .jsx 
  resolve: { 
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Copy everything from 'public' to the output directory. index.html is needed to start everything!
        { from: 'public', to: '' },   // copies files in public to root
        { from: 'public/index_prod.html', to: 'index.html' },
        { from: 'public/index_prod.html', to: '404.html' }
      ]
    })
  ],
  // setup where to put minified output file "the bundle", and any assets like jpegs. 
  output: {
    // specify bundle location.
    
    path: path.resolve(__dirname, outDir), 

    // before LAZYLOADING
    // filename: 'bundle_build.js', // name of combined file, the "bundle"

    // code from Copilot when asked to use custom filenames for the bundles
    // LAZYLOADING this gives bundles specified names. 
    /* problem: it produces another file:
            nginx_host/webPackOut/bundle_build.js
            nginx_host/webPackOut/vendorMoose_bundle.js
            nginx_host/webPackOut/vendors-node_modules_three_build_three_module_js.js
    */
    filename: (pathData) => { return pathData.chunk.name === 'vendorMoose'
        ? 'vendorMoose_bundle.js' : 'bundle_build.js';
    },

    // https://webpack.js.org/configuration/output/#outputlibrarytype
    // library type 'window' will not create a bundle file. It's for running as a server, or clicking on index.html.
    // I think it means "make library available via the DOM window object"
    // NOT ME >>  library: { name: 'MyLibrary' , type: 'window' } 
    // type: 'commonjs2' works on client but not local serve or clicking on index.html
    // library: { type: 'commonjs2' }     this runs ok nginx/google pages but gives error message about module not found
    library: { type: 'umd' } 
  },

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
  

  /* this works ok for publishing a bundle to npmjs, but not for
  deploying a whole react app to nginx or github pages.
  That's because it needs react.js of its own; there is no react app importing t
  the bundle; an app which already has its own react.
  externals: {        
    react: {          
        commonjs: 'react',          
        commonjs2: 'react',          
        amd: 'React',          
        root: 'React',      
    },      
    'react-dom': {          
        commonjs: 'react-dom',          
        commonjs2: 'react-dom',          
        amd: 'ReactDOM',          
        root: 'ReactDOM',      
    },  
    /    ** WARING: IF THIS IS LEFT OUT YOU GET MISLEADING ERROR ABOUT useNavigate() CANNOT BE CALLED OUTSIDE 
     *  OF A ROUTER OR SOMETHING LIKE THAT. HAS TO DO WITH DUPLICATE REACT OBJECTS.  *   /
    'react-router-dom': {          
      commonjs: 'react-router-dom',          
      commonjs2: 'react-router-dom',           
      // TODO: what are entries for amd and root??  
    },  
  },
  */

  // modules appears to be chunks of processing to do. 
  // In this case, there's 1 module which calls babel to convert jsx in React source to plain js
  module: {
    // jan 2025 typescript added. START of the babel rule
    rules: [  // here's the first rule in the array of rules
      { // feb 2025 added for sass, the css stylesheet thing
        test: /\.(scss|sass)$/,        
        use: [ 'style-loader',  'css-loader', 'sass-loader' ] 
      },
      { // START of the babel rule
        test: /\.(js|jsx|ts|tsx)$/,   // feed files *.js and *.js to babel. ref:https://webpack.js.org/configuration/module/#ruletest
        // not needed... include: [  path.resolve(__dirname, "src/zzz"), path.resolve(__dirname, "src/abc") ],
        exclude: /node_modules/, // dont send these hundreds of files to babel! Client will download these itself upon "npm i"
        use: {  // ref: https://webpack.js.org/configuration/module/#ruleuse
          loader: 'babel-loader', // node_modules/babel-loader/lib runs something here ...?
          // NOTE: options can be left out but you need a .babelrc with same presets.
          //       If you leave out both things, get fail without a description of whats wrong
          options: { "presets": ["@babel/preset-typescript", "@babel/preset-env", "@babel/preset-react"] }
        }, 
      },  
      {  // this rule includes .css files
        test: /\.css$/,
        use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' }
        ]
      }

    ]
  },
  // devServer does not apply to this build
  // devServer: {    ....
};

