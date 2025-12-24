#!/bin/bash

# This script modifies the git rebase todo list to squash commits into 8 groups

sed -i.bak '
# Group 1: Initial Setup (commits 1-5: 5b48851 pick, 2f1d32b-2a6d516 squash)
/^pick 2f1d32b/s/pick/squash/
/^pick 1e856c9/s/pick/squash/
/^pick 4325037/s/pick/squash/
/^pick 2a6d516/s/pick/squash/

# Group 2: CI/CD & Testing (commits 6-23: 8fca916 pick, rest squash)
/^pick b1b7f78/s/pick/squash/
/^pick 2aa9b60/s/pick/squash/
/^pick 839dc12/s/pick/squash/
/^pick 957d3c0/s/pick/squash/
/^pick 1c3c049/s/pick/squash/
/^pick e6c40fb/s/pick/squash/
/^pick d94e136/s/pick/squash/
/^pick 36994fd/s/pick/squash/
/^pick 7042d69/s/pick/squash/
/^pick f66d0fa/s/pick/squash/
/^pick 69baed9/s/pick/squash/
/^pick 51b54cb/s/pick/squash/
/^pick 38a0fe6/s/pick/squash/
/^pick 0e5f5b3/s/pick/squash/
/^pick e538bc2/s/pick/squash/
/^pick e8ac591/s/pick/squash/
/^pick 5305677/s/pick/squash/

# Group 3: Auth & Learning Ecosystem (commits 24-31: 7e5b8e8 pick, rest squash)
/^pick 96272a6/s/pick/squash/
/^pick c8a7235/s/pick/squash/
/^pick 1dfefec/s/pick/squash/
/^pick baa9320/s/pick/squash/
/^pick a49653d/s/pick/squash/
/^pick f0a70a3/s/pick/squash/
/^pick bfd8ad8/s/pick/squash/

# Group 4: Dashboard & Admin (commits 32-41: 103b9df pick, rest squash)
/^pick 431dda6/s/pick/squash/
/^pick 9b5e2b6/s/pick/squash/
/^pick cc7c807/s/pick/squash/
/^pick c718970/s/pick/squash/
/^pick 03a8a6e/s/pick/squash/
/^pick e346966/s/pick/squash/
/^pick f3759c7/s/pick/squash/
/^pick ba3d8e8/s/pick/squash/
/^pick f7005dd/s/pick/squash/

# Group 5: Course Administration (commits 42-48: dd1af31 pick, rest squash)
/^pick 488ccd5/s/pick/squash/
/^pick e9c0d5c/s/pick/squash/
/^pick fe89bbb/s/pick/squash/
/^pick 48a17fe/s/pick/squash/
/^pick 5b6a21a/s/pick/squash/
/^pick 51345ae/s/pick/squash/

# Group 6: Skills Architecture (commits 49-58: ab6aec3 pick, rest squash)
/^pick b805a03/s/pick/squash/
/^pick a99b0b7/s/pick/squash/
/^pick 84f4b56/s/pick/squash/
/^pick f1fa234/s/pick/squash/
/^pick 937b614/s/pick/squash/
/^pick 7699972/s/pick/squash/
/^pick 2e5b957/s/pick/squash/
/^pick 8a2f992/s/pick/squash/
/^pick 7baa0bf/s/pick/squash/

# Group 7: Learning Paths (commits 59-69: d075add pick, rest squash)
/^pick 21d88c8/s/pick/squash/
/^pick 90809b8/s/pick/squash/
/^pick 6201d3e/s/pick/squash/
/^pick 63c241e/s/pick/squash/
/^pick 9e098e6/s/pick/squash/
/^pick 5a49ace/s/pick/squash/
/^pick 6d46305/s/pick/squash/
/^pick c789d65/s/pick/squash/
/^pick 6fc358c/s/pick/squash/
/^pick 7c484f0/s/pick/squash/

# Group 8: Content Quality & Polish (commits 70-78: 4efe586 pick, rest squash)
/^pick fb87633/s/pick/squash/
/^pick 1ef6c3b/s/pick/squash/
/^pick c95bc6a/s/pick/squash/
/^pick 8526eaf/s/pick/squash/
/^pick f581815/s/pick/squash/
/^pick 7b35365/s/pick/squash/
/^pick 84f26be/s/pick/squash/
' "$1"
