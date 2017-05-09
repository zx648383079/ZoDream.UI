$data = npm outdated --parseable --depth=0
foreach ($item in $data) {
    $package = ($item -split ":")[-1]
    $package
    npm install "$package"
}