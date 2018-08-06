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
  await invoke "xml-transcripts"
  spawnNpmBin "webpack", ["-p", "--silent"]

task "xml-transcripts", "Generate XML transcripts from TUStep sources", () ->
  transcript = require "./lib/transcript-parser"

  tustepEnv = Object.assign {}, process.env,
    "TUSTEP_CMD": "xmlexport"
    "TUSTEP_INI": "tustep.ini"
    "TUSTEP_MEM": "00300000"

  transcriptsDir = path.resolve cwd, "transcripts", "conversion"

  spawn "tustep", [], { env: tustepEnv, cwd: transcriptsDir }

  transcripts = await globby path.resolve transcriptsDir, "*.xml"

  transcripts = for source in transcripts
    basename = path.basename source, "_neu.xml"
    [, manuscript, text, num] = basename.match /(v{1,2})(n?p)([0-9]+)/

    manuscript = manuscript.toUpperCase()
    text = text.toUpperCase()
    num = parseInt num, 10

    { source, manuscript, text, num }

  transcripts.sort (a, b) ->
    diff = a.manuscript.localeCompare b.manuscript
    if diff is 0 then a.num - b.num else diff

  transcripts = (transcript.parse source, si for source, si in transcripts)
  transcripts = await Promise.all transcripts

  transcripts = transcripts.reduce ((all, one) -> all.concat one), []

  transcripts = transcript.index transcripts

  transcriptsPath = path.resolve cwd, "htdocs", "transcript.json"
  xfs.outputJson transcriptsPath, transcripts, { spaces: 2 }