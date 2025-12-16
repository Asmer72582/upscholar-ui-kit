<?php
// Test if mod_rewrite is enabled
echo "<h1>GoDaddy Diagnostic Test</h1>";
echo "<h2>Server Information:</h2>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";

// Check if mod_rewrite is loaded
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    if (in_array('mod_rewrite', $modules)) {
        echo "<p style='color: green;'>✅ mod_rewrite is ENABLED</p>";
    } else {
        echo "<p style='color: red;'>❌ mod_rewrite is DISABLED</p>";
    }
} else {
    echo "<p style='color: orange;'>⚠️ Cannot detect mod_rewrite (might be CGI/FastCGI)</p>";
}

// Check if .htaccess is being read
echo "<h2>.htaccess Test:</h2>";
if (file_exists('.htaccess')) {
    echo "<p style='color: green;'>✅ .htaccess file EXISTS in current directory</p>";
    echo "<p>Content:</p><pre>" . htmlspecialchars(file_get_contents('.htaccess')) . "</pre>";
} else {
    echo "<p style='color: red;'>❌ .htaccess file NOT FOUND</p>";
}

// Check current directory
echo "<h2>Current Directory:</h2>";
echo "<p>Current working directory: " . getcwd() . "</p>";

// List files in current directory
echo "<h2>Files in current directory:</h2>";
$files = scandir('.');
echo "<ul>";
foreach ($files as $file) {
    if (substr($file, 0, 1) == '.') {
        echo "<li><strong>$file</strong> (hidden file)</li>";
    } else {
        echo "<li>$file</li>";
    }
}
echo "</ul>";
?>