path = require "path"
cp = require "child_process"
xfs = require "fs-extra"

pass = (path, passOpts...) ->
  passOpts = passOpts.concat [path]
  spawnOpts = { encoding: "utf8" }

  { stdout, stderr, status } = cp.spawnSync "pass", passOpts, spawnOpts

  return stdout.trim() if status == 0

  output = [stdout, stderr].join "\n"
  output = output.trim()
  throw new Error output

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


secretsPath = path.resolve __dirname, "..", "provisioning", "vars", "secrets.json"

xfs.outputJson secretsPath, secrets, { spaces: 2 }
