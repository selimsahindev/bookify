const rootStyles = window.getComputedStyle(document.documentElement);

const isCoverLarge = rootStyles.getPropertyValue('--book-cover-width-large');
if (isCoverLarge != null && isCoverLarge !== '') {
    ready();
} else {
    document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = coverWidth / coverAspectRatio;

    // Register fileponf plugins
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );
    
    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight,
    });
    
    FilePond.parse(document.body);
}
