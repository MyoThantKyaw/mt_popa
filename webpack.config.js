var path = require("path")

module.exports = {
    mode: "development",
    entry: {
        app: "./src/app.js"
    },
    output: {
        path : path.resolve("dis"),
        filename: "ch1_3ds.js"
    },

    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        },
        {
            test: /\.(jpe?g|png|tif)$/i,
            // include: path.join(__dirname, "src", "textures"),
            loaders: [
              "file-loader",
              {
                loader: "image-webpack-loader",
                query: {
                    progressive: true,

                    optimizationLevel: 7,
      
                    interlaced: false,
      
                    pngquant: {
      
                      quality: "65-90",
      
                      speed: 4
      
                    }
                }
              }
            ]
          }
        
    ]
    }
}