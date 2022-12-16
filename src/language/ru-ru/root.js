
var root = {
    // Locale
    $_code				    : 'ru',
    $_direction				: 'ltr',
    $_date_format_short	    : 'd.m.Y',
    $_date_format_long		: 'l, d F Y',
    $_time_format			: 'H:i:s',
    $_datetime_format		: 'd/m/Y H:i:s',
    $_decimal_point			: '.',
    $_thousand_point		: '',

   
    // Error
    $_error_exception       : 'Ошибка кода(%s): %s в %s на строке %s',
    $_error_upload_1        : 'Предупреждение: Размер загружаемого файла превышает значение upload_max_filesize в php.ini!',
    $_error_upload_2        : 'Предупреждение: Загруженный файл превышает MAX_FILE_SIZE значение, которая была указана в настройках!',
    $_error_upload_3        : 'Предупреждение: Загруженные файлы были загружены лишь частично!',
    $_error_upload_4        : 'Предупреждение: Нет файлов для загрузки!',
    $_error_upload_6        : 'Предупреждение: Временная папка!',
    $_error_upload_7        : 'Предупреждение: Ошибка записи!',
    $_error_upload_8        : 'Предупреждение: Запрещено загружать файл с данным расширением!',
    $_error_upload_999		: 'Предупреждение: Неизвестная ошибка!',
    $_error_curl			: 'CURL: Ошибка кода(%s): %s'
}

module.exports = { root }