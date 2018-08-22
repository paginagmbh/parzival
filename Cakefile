# https://coffeescript.org/#cake

path = require "path"
cp = require "child_process"
xfs = require "fs-extra"
del = require "del"
globby = require "globby"

cwd = path.resolve __dirname
encoding = "utf8"

spawn = (cmd, args, opts={}) ->
  opts = { cwd, encoding, stdio: "inherit", opts... }
  result = cp.spawnSync cmd, args, opts
  process.exit result.status unless result.status is 0
  result

spawnNpmBin = (cmd, args, opts) ->
  spawn "node_modules/.bin/#{cmd}", args, opts

###
Removes build artifacts, e.g. frontend resources in htdocs/.
###
task "clean", "Removes build artifacts", () ->
  await del ["htdocs/", "transcripts/conversion/*.xml"]

###
Writes configuration data and credentials and from shared password
store to the project directory. Files containing those data are
.gitignore'd.
###
task "configure", "Configures project, e.g. imports credentials", () ->
  pass = (path, passOpts...) ->
    stdio = ["inherit", "pipe", "inherit"]
    { stdout } = spawn "pass", [path], { stdio }
    stdout.trim()

  secrets =
    parzival:
      gitlab:
        id_rsa: pass "Uni-Bern/Parzival/Gitlab/id_rsa"
        id_rsa_pub: pass "Uni-Bern/Parzival/Gitlab/id_rsa.pub"
      http:
        user: pass "Uni-Bern/Parzival/HTTP/User"
        password: pass "Uni-Bern/Parzival/HTTP/Password"
      vpn:
        secret: pass "Uni-Bern/Parzival/VPN/Secret"
        user: pass "Uni-Bern/Parzival/VPN/User"
        password: pass "Uni-Bern/Parzival/VPN/Password"
      smb:
        host_ip: pass "Uni-Bern/Parzival/SMB/Host"
        user: pass "Uni-Bern/Parzival/SMB/User"
        password: pass "Uni-Bern/Parzival/SMB/Password"

  configPath = path.resolve __dirname, "config"
  secretsPath = path.resolve configPath, "secrets.json"

  xfs.outputJson secretsPath, secrets, { spaces: 2 }

task "build", "Builds the project", () ->
  await invoke "metadata"
  await invoke "tustep2xml"
  await invoke "xml2json"
  spawnNpmBin "webpack", ["-p", "--silent"]

task "metadata", "Processes metadata (verse concordances, quire structures)", () ->
  metadataParser = require "./lib/metadata-parser"

  metadata = await metadataParser()
  metadataPath = path.resolve cwd, "lib", "metadata.json"
  xfs.outputJson metadataPath, metadata, { spaces: 2 }

transcriptsDir = path.resolve cwd, "transcripts", "conversion"

task "tustep2xml", "Generate XML transcripts from TUStep sources", () ->
  tustepEnv = Object.assign {}, process.env,
    "TUSTEP_CMD": "xmlexport"
    "TUSTEP_INI": "tustep.ini"
    "TUSTEP_MEM": "00300000"

  spawn "tustep", [], { env: tustepEnv, cwd: transcriptsDir }

task "xml2json", "Generate JSON transcripts from XML sources", () ->
  sources = await globby path.resolve transcriptsDir, "*.xml"

  sources = for source in sources
    basename = path.basename source, "_neu.xml"
    [, manuscript, index] = basename.match /(v{1,2})n?p([0-9]+)/
    manuscript = manuscript.toUpperCase()
    num = parseInt index, 10
    { source, manuscript, index }

  sources = sources.sort (a, b) ->
     (a.manuscript.localeCompare b.manuscript) or (a.index - b.index)

  transcriptParser = require "./lib/transcript-parser"
  transcript = await transcriptParser sources

  transcriptPath = path.resolve cwd, "lib", "transcript.json"
  xfs.outputJson transcriptPath, transcript, { spaces: 2 }

task "img2ptif", "Generate pyramidal TIFF images for IIIF service", () ->
  imageDir = process.env.PARZIVAL_IMAGE_BASE ? "/srv/bern"
  ptifDir = process.env.PARZIVAL_PTIF_BASE ? "/var/www/iiif"

  for base in ["HS V unkomprimiert", "HS VV unkomprimiert"]
    base = path.resolve imageDir, base
    patterns = (path.resolve base, p for p in ["VV*.JPG", "*.tif"])
    images = await globby patterns
    for image in images
      ext = path.extname image
      imageBase = path.basename image, ext
      imageBase = imageBase.toLowerCase()
      if not imageBase.match(/^v{1,2}[0-9]{3}[rv]$/) then continue
      ptif = path.resolve ptifDir, "#{imageBase}.ptif"
      if not await xfs.pathExists ptif
        spawn "vips", [
          "tiffsave",
          image, ptif
          "--tile", "--pyramid",
          "--compression=jpeg",
          "--tile-width", "256", "--tile-height", "256"]
